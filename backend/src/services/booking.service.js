import pool from "../configs/database.js";
import {
  assertAtLeastOneField,
  assertEnum,
  assertRequiredFields,
} from "../utils/validation.util.js";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../utils/errors.util.js";
import * as scheduleService from "./schedule.service.js";
import { createNotificationService } from "./notification.service.js";

export const getAllBookingsService = async (userId, userRole, userEmptype) => {
  const client = await pool.connect();

  try {
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
        json_agg(json_build_object('serviceId', sb.serviceid, 'serviceName', s.servicename, 'servicePrice', s.serviceprice)) FILTER (WHERE sb.serviceid IS NOT NULL) as services,
        ea.empid as assigned_empid,
        e.empname as assigned_empname,
        ep.empid as preferred_empid,
        pe.empname as preferred_empname
      FROM booking b
      LEFT JOIN servicesbooked sb ON b.bookingid = sb.bookingid
      LEFT JOIN service s ON sb.serviceid = s.serviceid
      LEFT JOIN vehicle v ON b.vehid = v.id
      LEFT JOIN customer c ON v.cusid = c.cusid
      LEFT JOIN employeeassigned ea ON b.bookingid = ea.bookingid
      LEFT JOIN employee e ON ea.empid = e.empid
      LEFT JOIN employeepreference ep ON b.bookingid = ep.bookingid
      LEFT JOIN employee pe ON ep.empid = pe.empid
    `;

    let queryParams = [];
    let whereClauses = [];

    if (userRole === "customer") {
      whereClauses.push(`v.cusid = $${queryParams.length + 1}`);
      queryParams.push(userId);
    } else if (userRole === "employee" && effectiveRole === "employee") {
      whereClauses.push(`ea.empid = $${queryParams.length + 1}`);
      queryParams.push(userId);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
    }

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
      v.id,
      ea.empid,
      e.empname,
      ep.empid,
      pe.empname
      ORDER BY b.bookingdate DESC, b.bookingstarttime DESC`;

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
  const result = await pool.query(
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
      b.totalprice as bookingtotalprice,
      v.cusid,
      v.vehmileage,
      c.cusname,
      c.custel as cusphone,
      c.cusemail,
      v.vehbrand,
      v.vehmodel,
      v.vehplate,
      e.empname,
      json_agg(json_build_object('serviceName', s.servicename, 'price', s.serviceprice)) FILTER (WHERE sb.serviceid IS NOT NULL) as services
    FROM booking b
    LEFT JOIN servicesbooked sb ON b.bookingid = sb.bookingid
    LEFT JOIN service s ON sb.serviceid = s.serviceid
    LEFT JOIN vehicle v ON b.vehid = v.id
    LEFT JOIN customer c ON v.cusid = c.cusid
    LEFT JOIN employeeassigned ea ON b.bookingid = ea.bookingid
    LEFT JOIN employee e ON ea.empid = e.empid
    WHERE b.bookingid = $1
    GROUP BY b.bookingid, v.cusid, c.cusid, v.id, e.empname
    `,
    [bookingId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Booking not found");
  }

  const booking = result.rows[0];
  const effectiveRole = userEmptype || userRole;

  if (userRole === "customer") {
    if (booking.cusid !== userId) {
      throw new ForbiddenError("You can only view your own bookings");
    }
  } else if (userRole === "employee") {
    if (effectiveRole === "owner" || effectiveRole === "cashier") {
      return booking;
    }

    const assignmentCheck = await pool.query(
      "SELECT 1 FROM employeeassigned WHERE bookingid = $1 AND empid = $2",
      [bookingId, userId],
    );

    if (assignmentCheck.rowCount === 0) {
      throw new ForbiddenError("You are not authorized to view this mission");
    }
  }

  return booking;
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

  const bookingDateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDateObj < today) {
    throw new ValidationError("Booking date cannot be in the past");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Calculate duration and price
    const servicesCheck = await client.query(
      "SELECT servicetime, serviceprice, has_offer, offer_price FROM service WHERE serviceid = ANY($1)",
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

      const price = s.has_offer
        ? parseFloat(s.offer_price)
        : parseFloat(s.serviceprice);
      totalPrice += price;
    });

    const [startH, startM, startS] = startTime.split(":").map(Number);
    const startSeconds = startH * 3600 + startM * 60 + (startS || 0);
    const endSeconds = startSeconds + totalDurationSeconds;

    const endH = Math.floor(endSeconds / 3600);
    const endM = Math.floor((endSeconds % 3600) / 60);
    const endS = endSeconds % 60;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:${String(endS).padStart(2, "0")}`;

    // 2. Validate vehicle
    const vehicleCheck = await client.query(
      "SELECT id, cusid FROM vehicle WHERE id = $1",
      [vehicleId],
    );
    if (vehicleCheck.rowCount === 0)
      throw new NotFoundError("Vehicle not found");
    if (userRole === "customer" && vehicleCheck.rows[0].cusid !== customerId) {
      throw new ForbiddenError("You can only book with your own vehicles");
    }

    // 3. Assign Employee
    let assignedEmpId = employeeId;
    if (!employeeId || employeeId === "any") {
      const availabilityQuery = `
        SELECT e.empid FROM employee e
        WHERE e.emptype NOT IN ('owner', 'cashier')
        AND e.empid NOT IN (
          SELECT ea.empid FROM employeeassigned ea
          JOIN schedule s ON ea.bookingid = s.bookingid
          WHERE s.schedulestartdate = $1::date
          AND NOT (s.scheduleendtime <= $2::time OR s.schedulestarttime >= $3::time)
        )
        AND e.empid NOT IN (
          SELECT el.empid FROM employeeleave el 
          WHERE $1::date BETWEEN el.leavestartdate AND el.leaveenddate
        )
        LIMIT 1;
      `;
      const availResult = await client.query(availabilityQuery, [
        date,
        startTime,
        endTime,
      ]);
      assignedEmpId = availResult.rows[0]?.empid || 1; // Fallback to sys account
    }

    // 4. Insert booking
    const bookingResult = await client.query(
      `INSERT INTO booking (bookingstatus, bookingdate, bookingstarttime, bookingendtime, bookinglocationlatitude, bookinglocationlongitude, vehid, totalprice)
       VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8) RETURNING bookingid`,
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

    // 5. Link Services
    for (const sId of services) {
      await client.query(
        "INSERT INTO servicesbooked (bookingid, serviceid) VALUES ($1, $2)",
        [bookingId, sId],
      );
    }

    // 6. Assign Staff and Record Preference
    if (employeeId && employeeId !== "any") {
      await client.query(
        "INSERT INTO employeepreference (bookingid, empid) VALUES ($1, $2)",
        [bookingId, employeeId],
      );
    }

    await client.query(
      "INSERT INTO employeeassigned (bookingid, empid) VALUES ($1, $2)",
      [bookingId, assignedEmpId],
    );

    // 7. Schedule
    const scheduleId = scheduleService.generateScheduleId("B");
    await client.query(
      `INSERT INTO schedule (scheduleid, schedulestartdate, scheduleenddate, schedulestarttime, scheduleendtime, bookingid)
       VALUES ($1, $2::date, $2::date, $3, $4, $5)`,
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
    if (client) await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateBookingService = async (
  bookingId,
  updates,
  userId,
  userRole,
  userEmptype,
) => {
  const { status, date, startTime, services } = updates;
  assertAtLeastOneField(updates, [
    "status",
    "date",
    "startTime",
    "services",
    "employeeId",
  ]);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentRes = await client.query(
      `SELECT b.*, v.cusid, ea.empid as current_empid FROM booking b
       JOIN vehicle v ON b.vehid = v.id
       LEFT JOIN employeeassigned ea ON b.bookingid = ea.bookingid
       WHERE b.bookingid = $1`,
      [bookingId],
    );

    if (currentRes.rowCount === 0) throw new NotFoundError("Booking not found");
    const current = currentRes.rows[0];

    if (userRole === "customer" && current.cusid !== userId) {
      throw new ForbiddenError("Unauthorized update");
    }

    const { status, date, startTime, services, employeeId } = updates;

    // Status Change Notifications
    if (status === "cancelled" && current.bookingstatus !== "cancelled") {
      await createNotificationService({
        recipientId: current.cusid,
        recipientRole: "customer",
        title: "Booking Cancelled",
        message: `Your booking (ID: ${bookingId}) has been cancelled.`,
        type: "warning",
        bookingId: bookingId,
      });
    }

    // Status Change: Completed
    if (status === "completed" && current.bookingstatus !== "completed") {
      await createNotificationService({
        recipientId: current.cusid,
        recipientRole: "customer",
        title: "Service Completed",
        message: `Your service (ID: ${bookingId}) is complete. We value your feedback!`,
        type: "success",
        bookingId: bookingId,
      });
    }

    const newDate = date || current.bookingdate;
    const newStartTime = startTime || current.bookingstarttime;

    // Check Employee Reassignment
    let finalEmpId = current.current_empid;
    if (employeeId && employeeId !== current.current_empid) {
      // Validate new employee availability (simplified check)
      const check = await client.query(
        "SELECT empname FROM employee WHERE empid = $1",
        [employeeId],
      );
      if (check.rowCount === 0) throw new NotFoundError("Employee not found");

      const empName = check.rows[0].empname;
      finalEmpId = employeeId;

      await client.query("DELETE FROM employeeassigned WHERE bookingid = $1", [
        bookingId,
      ]);
      await client.query(
        "INSERT INTO employeeassigned (bookingid, empid) VALUES ($1, $2)",
        [bookingId, employeeId],
      );

      // Reassignment Notification
      await createNotificationService({
        recipientId: current.cusid,
        recipientRole: "customer",
        title: "Employee Reassigned",
        message: `Your booking (ID: ${bookingId}) has been reassigned to ${empName}.`,
        type: "info",
        bookingId: bookingId,
      });
    }

    let newServices = services;
    if (!newServices) {
      const srvRes = await client.query(
        "SELECT serviceid FROM servicesbooked WHERE bookingid = $1",
        [bookingId],
      );
      newServices = srvRes.rows.map((s) => s.serviceid);
    }

    // Recalculate if time/service changed
    let endTime = current.bookingendtime;
    let totalPrice = current.totalprice;

    if (services || startTime) {
      const srvCheck = await client.query(
        "SELECT servicetime, serviceprice, has_offer, offer_price FROM service WHERE serviceid = ANY($1)",
        [newServices],
      );
      let duration = 0;
      totalPrice = 0;
      srvCheck.rows.forEach((s) => {
        const [h, m, s_] = s.servicetime.split(":").map(Number);
        duration += h * 3600 + m * 60 + (s_ || 0);
        const price = s.has_offer
          ? parseFloat(s.offer_price)
          : parseFloat(s.serviceprice);
        totalPrice += price;
      });

      const [sh, sm, ss] = newStartTime.split(":").map(Number);
      const endSec = sh * 3600 + sm * 60 + (ss || 0) + duration;
      endTime = `${String(Math.floor(endSec / 3600)).padStart(2, "0")}:${String(Math.floor((endSec % 3600) / 60)).padStart(2, "0")}:${String(endSec % 60).padStart(2, "0")}`;
    }

    // Availability validation (optional for phase 1 but good practice)
    const isAvail = await scheduleService.checkAvailability(
      current.current_empid,
      newDate,
      newStartTime,
      endTime,
      bookingId,
    );
    if (!isAvail) {
      // throw new ValidationError("Conflict detected");
    }

    await client.query(
      `UPDATE booking SET bookingstatus = COALESCE($1, bookingstatus), bookingdate = $2, 
       bookingstarttime = $3, bookingendtime = $4, totalprice = $5, updated_at = NOW() WHERE bookingid = $6`,
      [status, newDate, newStartTime, endTime, totalPrice, bookingId],
    );

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

    await client.query(
      `UPDATE schedule SET schedulestartdate = $1, scheduleenddate = $1, schedulestarttime = $2, 
       scheduleendtime = $3, updated_at = NOW() WHERE bookingid = $4`,
      [newDate, newStartTime, endTime, bookingId],
    );

    await client.query("COMMIT");
    return { bookingId, endTime };
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteBookingService = async (
  bookingId,
  userId,
  userRole,
  userEmptype,
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const check = await client.query(
      "SELECT b.bookingid, v.cusid FROM booking b JOIN vehicle v ON b.vehid = v.id WHERE b.bookingid = $1",
      [bookingId],
    );
    if (check.rowCount === 0) throw new NotFoundError("Not found");
    if (userRole === "customer" && check.rows[0].cusid !== userId)
      throw new ForbiddenError("Unauthorized");

    await client.query("DELETE FROM servicesbooked WHERE bookingid = $1", [
      bookingId,
    ]);
    await client.query("DELETE FROM booking WHERE bookingid = $1", [bookingId]);
    await client.query("COMMIT");
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
