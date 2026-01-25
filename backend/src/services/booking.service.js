import pool from "../configs/database.js";
import {
  assertAtLeastOneField,
  assertEnum,
  assertRequiredFields,
  validationError,
} from "../utils/validation.util.js";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../utils/errors.util.js";

export const getAllBookingsService = async (userId, userRole, userEmptype) => {
  const client = await pool.connect();

  try {
    // Determine effective role
    const effectiveRole = userEmptype || userRole;

    let query = `
      SELECT 
        b.bookingid,
        b.bookingstatus,
        b.bookingdate,
        b.bookingstarttime,
        b.bookingendtime,
        b.bookinglocationlatitude,
        b.bookinglocationlongitude,
        b.vehid,
        b.totalprice,
        v.cusid,
        c.cusname,
        c.custel as cusphone,
        c.cusemail,
        v.vehbrand,
        v.vehmodel,
        v.vehplate,
        json_agg(json_build_object('serviceId', sb.serviceid, 'serviceName', s.servicename)) FILTER (WHERE sb.serviceid IS NOT NULL) as services
      FROM booking b
      LEFT JOIN servicesbooked sb ON b.bookingid = sb.bookingid
      LEFT JOIN service s ON sb.serviceid = s.serviceid
      LEFT JOIN vehicle v ON b.vehid = v.id
      LEFT JOIN customer c ON v.cusid = c.cusid
    `;

    let queryParams = [];

    // If customer, show only their bookings
    if (userRole === "customer") {
      query += ` WHERE v.cusid = $1`;
      queryParams.push(userId);
    }
    // If employee (any type), show all bookings
    // No WHERE clause needed - they can see everything

    query += ` GROUP BY 
      b.bookingid, 
      b.bookingstatus, 
      b.bookingdate, 
      b.bookingstarttime, 
      b.bookingendtime, 
      b.bookinglocationlatitude, 
      b.bookinglocationlongitude, 
      b.vehid, 
      b.totalprice,
      v.cusid,
      c.cusname,
      c.custel,
      c.cusemail,
      v.vehbrand,
      v.vehmodel,
      v.vehplate,
      v.id`;

    const result = await client.query(query, queryParams);
    return result.rows;
  } finally {
    client.release();
  }
};

export const getBookingService = async (
  bookingId,
  userId,
  userRole,
  userEmptype,
) => {
  const client = await pool.connect();

  try {
    // Determine effective role
    const effectiveRole = userEmptype || userRole;

    const result = await client.query(
      `
      SELECT 
        b.bookingid,
        b.bookingstatus,
        b.bookingdate,
        b.bookingstarttime,
        b.bookingendtime,
        b.bookinglocationlatitude,
        b.bookinglocationlongitude,
        b.vehid,
        v.cusid,
        c.cusname,
        c.custel as cusphone,
        c.cusemail,
        v.vehbrand,
        v.vehmodel,
        v.vehplate,
        json_agg(json_build_object('serviceId', sb.serviceid, 'serviceName', s.servicename)) FILTER (WHERE sb.serviceid IS NOT NULL) as services
      FROM booking b
      LEFT JOIN servicesbooked sb ON b.bookingid = sb.bookingid
      LEFT JOIN service s ON sb.serviceid = s.serviceid
      LEFT JOIN vehicle v ON b.vehid = v.id
      LEFT JOIN customer c ON v.cusid = c.cusid
      WHERE b.bookingid = $1
      GROUP BY b.bookingid, v.cusid, c.cusid, v.id
      `,
      [bookingId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundError("Booking not found");
    }

    const booking = result.rows[0];

    // Authorization checks
    if (userRole === "customer") {
      // Customer can only see their own bookings
      if (booking.cusid !== userId) {
        throw new ForbiddenError("You can only view your own bookings");
      }
    }
    // Employees can view any booking

    return booking;
  } finally {
    client.release();
  }
};

export const createBookingService = async ({
  customerId,
  status,
  date,
  startTime,
  locationLatitude,
  locationLongitude,
  vehicleId,
  services,
  userRole,
  employeeId,
}) => {
  assertRequiredFields(
    {
      customerId,
      status,
      date,
      startTime,
      locationLatitude,
      locationLongitude,
      vehicleId,
      services,
    },
    [
      "customerId",
      "status",
      "date",
      "startTime",
      "locationLatitude",
      "locationLongitude",
      "vehicleId",
      "services",
    ],
  );

  assertEnum(status, "status", ["pending", "inProgress", "completed", "paid"]);

  // Service layer validation for past dates (replacing rigid DB constraint)
  const bookingDateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDateObj < today) {
    throw new ValidationError("Booking date cannot be in the past");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Fetch service details and calculate totals
    const servicesCheck = await client.query(
      "SELECT serviceid, servicename, servicetime, serviceprice FROM service WHERE serviceid = ANY($1)",
      [services],
    );

    if (servicesCheck.rowCount !== services.length) {
      throw new NotFoundError("One or more service IDs do not exist");
    }

    let totalDurationSeconds = 0;
    let totalPrice = 0;

    servicesCheck.rows.forEach((s) => {
      const [hours, minutes, seconds] = s.servicetime.split(":").map(Number);
      totalDurationSeconds += hours * 3600 + minutes * 60 + (seconds || 0);
      totalPrice += parseFloat(s.serviceprice);
    });

    // Calculate endTime
    const [startH, startM, startS] = startTime.split(":").map(Number);
    const startSeconds = startH * 3600 + startM * 60 + (startS || 0);
    const endSeconds = startSeconds + totalDurationSeconds;

    const endH = Math.floor(endSeconds / 3600);
    const endM = Math.floor((endSeconds % 3600) / 60);
    const endS = endSeconds % 60;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(
      2,
      "0",
    )}:${String(endS).padStart(2, "0")}`;

    // 2. Validate vehicle ownership
    const vehicleCheck = await client.query(
      "SELECT id, cusid FROM vehicle WHERE id = $1",
      [vehicleId],
    );

    if (vehicleCheck.rowCount === 0) {
      throw new NotFoundError("Vehicle not found");
    }

    if (userRole === "customer" && vehicleCheck.rows[0].cusid !== customerId) {
      throw new ForbiddenError("You can only book with your own vehicles");
    }

    let assignedEmpId;

    if (employeeId && employeeId !== "any") {
      // If specific employee requested, verify they are not on leave and not occupied
      const specificAvailabilityQuery = `
        SELECT e.empid 
        FROM employee e
        WHERE e.empid = $4
        AND e.empid NOT IN (
          SELECT el.empid FROM employeeleave el 
          WHERE $1::date BETWEEN el.leavestartdate AND el.leaveenddate
        )
        AND e.empid NOT IN (
          SELECT ea.empid FROM employeeassigned ea
          JOIN schedule s ON ea.bookingid = s.bookingid
          WHERE s.schedulestartdate = $1::date
          AND NOT (s.scheduleendtime <= $2::time OR s.schedulestarttime >= $3::time)
        )
        LIMIT 1;
      `;
      const specificResult = await client.query(specificAvailabilityQuery, [
        date,
        startTime,
        endTime,
        employeeId,
      ]);

      if (specificResult.rowCount > 0) {
        assignedEmpId = specificResult.rows[0].empid;
      } else {
        // Fallback for now as per user request (make all available)
        // If specific fails, we still allow it by just using the provided ID
        assignedEmpId = employeeId;
      }
    } else {
      // Auto-assign logic
      const availabilityQuery = `
        SELECT e.empid 
        FROM employee e
        WHERE e.empid NOT IN (
          -- Employees on leave
          SELECT el.empid 
          FROM employeeleave el 
          WHERE $1::date BETWEEN el.leavestartdate AND el.leaveenddate
        )
        AND e.empid NOT IN (
          -- Employees with overlapping schedules
          SELECT ea.empid 
          FROM employeeassigned ea
          JOIN schedule s ON ea.bookingid = s.bookingid
          WHERE s.schedulestartdate = $1::date
          AND NOT (s.scheduleendtime <= $2::time OR s.schedulestarttime >= $3::time)
        )
        LIMIT 1;
      `;
      const availabilityResult = await client.query(availabilityQuery, [
        date,
        startTime,
        endTime,
      ]);

      if (availabilityResult.rowCount > 0) {
        assignedEmpId = availabilityResult.rows[0].empid;
      } else {
        // Fallback: Just pick any employee (not on owner/manager type ideally, but for now any)
        // This satisfies "make all timeslots available"
        const fallbackResult = await client.query(
          "SELECT empid FROM employee WHERE emptype != 'owner' LIMIT 1",
        );
        if (fallbackResult.rowCount > 0) {
          assignedEmpId = fallbackResult.rows[0].empid;
        } else {
          throw new ValidationError(
            "No employees available in the system. Please register an employee first.",
          );
        }
      }
    }

    // 4. Insert booking
    const bookingResult = await client.query(
      `
      INSERT INTO booking
      (bookingstatus, bookingdate, bookingstarttime, bookingendtime, bookinglocationlatitude, bookinglocationlongitude, vehid, totalprice)
      VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8)
      RETURNING bookingid
      `,
      [
        status,
        date,
        startTime,
        endTime,
        locationLatitude,
        locationLongitude,
        vehicleId,
        totalPrice,
      ],
    );

    const bookingId = bookingResult.rows[0].bookingid;

    // 5. Insert services booked
    for (const serviceId of services) {
      await client.query(
        "INSERT INTO servicesbooked (bookingid, serviceid) VALUES ($1, $2)",
        [bookingId, serviceId],
      );
    }

    // 6. Assign employee
    await client.query(
      "INSERT INTO employeeassigned (bookingid, empid) VALUES ($1, $2)",
      [bookingId, assignedEmpId],
    );

    // 7. Create schedule entry
    // Generate a 7-character random ID for schedule (as per model constraints)
    const scheduleId = Math.random().toString(36).substring(2, 9).toUpperCase();
    await client.query(
      `
      INSERT INTO schedule 
      (scheduleid, schedulestartdate, scheduleenddate, schedulestarttime, scheduleendtime, bookingid)
      VALUES ($1, $2::date, $2::date, $3, $4, $5)
      `,
      [scheduleId, date, startTime, endTime, bookingId],
    );

    await client.query("COMMIT");

    return {
      bookingId,
      endTime,
      totalPrice,
      assignedEmployeeId: assignedEmpId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * UPDATE BOOKING
 */
export const updateBookingService = async (
  bookingId,
  updates,
  userId,
  userRole,
  userEmptype,
) => {
  const { status, date, startTime, services } = updates;

  assertAtLeastOneField(updates, ["status", "date", "startTime", "services"]);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Get current booking details
    const currentBookingResult = await client.query(
      `
      SELECT b.*, v.cusid, ea.empid as current_empid
      FROM booking b
      JOIN vehicle v ON b.vehid = v.id
      LEFT JOIN employeeassigned ea ON b.bookingid = ea.bookingid
      WHERE b.bookingid = $1
      `,
      [bookingId],
    );

    if (currentBookingResult.rowCount === 0) {
      throw new NotFoundError("Booking not found");
    }

    const currentBooking = currentBookingResult.rows[0];

    // Authorization check
    if (userRole === "customer" && currentBooking.cusid !== userId) {
      throw new ForbiddenError("You can only update your own bookings");
    }

    // 2. Determine new values
    const newDate = date || currentBooking.bookingdate;
    const newStartTime = startTime || currentBooking.bookingstarttime;

    let newServices = services;
    if (!newServices) {
      const existingServices = await client.query(
        "SELECT serviceid FROM servicesbooked WHERE bookingid = $1",
        [bookingId],
      );
      newServices = existingServices.rows.map((s) => s.serviceid);
    }

    // 3. Recalculate duration and price if necessary
    let endTime = currentBooking.bookingendtime;
    let totalPrice = currentBooking.totalprice;

    if (services || startTime) {
      const servicesCheck = await client.query(
        "SELECT serviceid, servicetime, serviceprice FROM service WHERE serviceid = ANY($1)",
        [newServices],
      );

      if (servicesCheck.rowCount !== newServices.length) {
        throw new NotFoundError("One or more service IDs do not exist");
      }

      let totalDurationSeconds = 0;
      totalPrice = 0;

      servicesCheck.rows.forEach((s) => {
        const [hours, minutes, seconds] = s.servicetime.split(":").map(Number);
        totalDurationSeconds += hours * 3600 + minutes * 60 + (seconds || 0);
        totalPrice += parseFloat(s.serviceprice);
      });

      const [startH, startM, startS] = newStartTime.split(":").map(Number);
      const startSeconds = startH * 3600 + startM * 60 + (startS || 0);
      const endSeconds = startSeconds + totalDurationSeconds;

      const endH = Math.floor(endSeconds / 3600);
      const endM = Math.floor((endSeconds % 3600) / 60);
      const endS = endSeconds % 60;
      endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:${String(endS).padStart(2, "0")}`;
    }

    // 4. Check availability if timing/date changed
    let assignedEmpId = currentBooking.current_empid;
    if (date || startTime || services) {
      const availabilityQuery = `
        SELECT e.empid 
        FROM employee e
        WHERE e.empid NOT IN (
          -- Employees on leave
          SELECT el.empid 
          FROM employeeleave el 
          WHERE $1::date BETWEEN el.leavestartdate AND el.leaveenddate
        )
        AND e.empid NOT IN (
          -- Employees with overlapping schedules (excluding this booking)
          SELECT ea.empid 
          FROM employeeassigned ea
          JOIN schedule s ON ea.bookingid = s.bookingid
          WHERE s.schedulestartdate = $1::date
          AND s.bookingid != $4
          AND NOT (s.scheduleendtime <= $2::time OR s.schedulestarttime >= $3::time)
        )
        ORDER BY (e.empid = $5) DESC -- Prefer current employee if available
        LIMIT 1;
      `;

      const availabilityResult = await client.query(availabilityQuery, [
        newDate,
        newStartTime,
        endTime,
        bookingId,
        assignedEmpId,
      ]);

      if (availabilityResult.rowCount === 0) {
        throw new ValidationError(
          "No employees are available for the updated time slot",
        );
      }
      assignedEmpId = availabilityResult.rows[0].empid;
    }

    // 5. Update booking
    const updateResult = await client.query(
      `
      UPDATE booking
      SET bookingstatus = COALESCE($1, bookingstatus),
          bookingdate = $2,
          bookingstarttime = $3,
          bookingendtime = $4,
          totalprice = $5,
          updated_at = NOW()
      WHERE bookingid = $6
      `,
      [status, newDate, newStartTime, endTime, totalPrice, bookingId],
    );

    // 6. Update servicesbooked if services changed
    if (services) {
      await client.query("DELETE FROM servicesbooked WHERE bookingid = $1", [
        bookingId,
      ]);
      for (const sId of services) {
        await client.query(
          "INSERT INTO servicesbooked (bookingid, serviceid) VALUES ($1, $2)",
          [bookingId, sId],
        );
      }
    }

    // 7. Update employee assignment if changed
    if (assignedEmpId !== currentBooking.current_empid) {
      await client.query(
        "UPDATE employeeassigned SET empid = $1 WHERE bookingid = $2",
        [assignedEmpId, bookingId],
      );
    }

    // 8. Update schedule
    await client.query(
      `
      UPDATE schedule
      SET schedulestartdate = $1,
          scheduleenddate = $1,
          schedulestarttime = $2,
          scheduleendtime = $3,
          updated_at = NOW()
      WHERE bookingid = $4
      `,
      [newDate, newStartTime, endTime, bookingId],
    );

    await client.query("COMMIT");

    return {
      bookingId,
      endTime,
      totalPrice,
      assignedEmployeeId: assignedEmpId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * DELETE BOOKING
 */
export const deleteBookingService = async (
  bookingId,
  userId,
  userRole,
  userEmptype,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check ownership
    const bookingCheck = await client.query(
      `
      SELECT b.bookingid, v.cusid
      FROM booking b
      JOIN vehicle v ON b.vehid = v.id
      WHERE b.bookingid = $1
      `,
      [bookingId],
    );

    if (bookingCheck.rowCount === 0) {
      throw new NotFoundError("Booking not found");
    }

    const bookingOwnerId = bookingCheck.rows[0].cusid;
    const effectiveRole = userEmptype || userRole;

    if (userRole === "customer" && bookingOwnerId !== userId) {
      throw new ForbiddenError("You can only delete your own bookings");
    }
    // Employees/managers/owners allowed

    await client.query("DELETE FROM servicesbooked WHERE bookingid = $1", [
      bookingId,
    ]);

    await client.query("DELETE FROM booking WHERE bookingid = $1", [bookingId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
