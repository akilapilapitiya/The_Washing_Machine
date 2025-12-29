import pool from "../configs/database.js";
import {
  assertAtLeastOneField,
  assertEnum,
  assertRequiredFields,
  validationError,
} from "../utils/validation.util.js";

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
        v.cusid,
        json_agg(json_build_object('serviceId', sb.serviceid, 'serviceName', s.servicename)) FILTER (WHERE sb.serviceid IS NOT NULL) as services
      FROM booking b
      LEFT JOIN servicesbooked sb ON b.bookingid = sb.bookingid
      LEFT JOIN service s ON sb.serviceid = s.serviceid
      LEFT JOIN vehicle v ON b.vehid = v.vehid
    `;

    let queryParams = [];

    // If customer, show only their bookings
    if (userRole === "customer") {
      query += ` WHERE v.cusid = $1`;
      queryParams.push(userId);
    }
    // If employee (any type), show all bookings
    // No WHERE clause needed - they can see everything

    query += ` GROUP BY b.bookingid, v.cusid`;

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
  userEmptype
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
        json_agg(json_build_object('serviceId', sb.serviceid, 'serviceName', s.servicename)) FILTER (WHERE sb.serviceid IS NOT NULL) as services
      FROM booking b
      LEFT JOIN servicesbooked sb ON b.bookingid = sb.bookingid
      LEFT JOIN service s ON sb.serviceid = s.serviceid
      LEFT JOIN vehicle v ON b.vehid = v.vehid
      WHERE b.bookingid = $1
      GROUP BY b.bookingid, v.cusid
      `,
      [bookingId]
    );

    if (result.rowCount === 0) {
      throw new Error("Booking not found");
    }

    const booking = result.rows[0];

    // Authorization checks
    if (userRole === "customer") {
      // Customer can only see their own bookings
      if (booking.cusid !== userId) {
        throw new Error("You can only view your own bookings");
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
  endTime,
  locationLatitude,
  locationLongitude,
  vehicleId,
  services,
  userRole,
}) => {
  assertRequiredFields(
    {
      customerId,
      status,
      date,
      startTime,
      endTime,
      locationLatitude,
      locationLongitude,
      vehicleId,
    },
    [
      "customerId",
      "status",
      "date",
      "startTime",
      "endTime",
      "locationLatitude",
      "locationLongitude",
      "vehicleId",
    ]
  );

  assertEnum(status, "status", ["pending", "inProgress", "completed", "paid"]);

  // Quick service-layer check for time ordering
  if (startTime && endTime && startTime >= endTime) {
    throw validationError("End time must be after start time", [
      { field: "endTime", message: "End time must be after start time" },
    ]);
  }
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Validate vehicle exists and belongs to customer (if user is a customer)
    const vehicleCheck = await client.query(
      "SELECT vehid, cusid FROM vehicle WHERE vehid = $1",
      [vehicleId]
    );

    if (vehicleCheck.rowCount === 0) {
      throw new Error("Vehicle not found");
    }

    // If the user is a customer, verify they own the vehicle
    if (userRole === "customer" && vehicleCheck.rows[0].cusid !== customerId) {
      throw new Error("You can only book with your own vehicles");
    }

    // Validate the date meets the constraint
    const dateCheck = await client.query(
      "SELECT $1::date >= CURRENT_DATE as is_valid",
      [date]
    );

    if (!dateCheck.rows[0].is_valid) {
      throw new Error("Booking date must be today or in the future");
    }

    // Insert booking
    const bookingResult = await client.query(
      `
      INSERT INTO booking
      (bookingstatus, bookingdate, bookingstarttime, bookingendtime, bookinglocationlatitude, bookinglocationlongitude, vehid)
      VALUES ($1, $2::date, $3, $4, $5, $6, $7)
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
      ]
    );

    const bookingId = bookingResult.rows[0].bookingid;

    // Validate services exist before inserting
    if (services && services.length > 0) {
      const servicesCheck = await client.query(
        "SELECT serviceid FROM service WHERE serviceid = ANY($1)",
        [services]
      );

      if (servicesCheck.rowCount !== services.length) {
        throw new Error("One or more service IDs do not exist");
      }

      // Insert into servicesbooked (many-to-many)
      for (const serviceId of services) {
        await client.query(
          `
          INSERT INTO servicesbooked (bookingid, serviceid)
          VALUES ($1, $2)
          `,
          [bookingId, serviceId]
        );
      }
    }

    await client.query("COMMIT");

    return { bookingId };
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
  userEmptype
) => {
  const { status, date, startTime, endTime, services } = updates;

  assertAtLeastOneField(updates, ["status", "date", "startTime", "endTime", "services"]);
  assertEnum(status, "status", ["pending", "inProgress", "completed", "paid"]);
  if (startTime && endTime && startTime >= endTime) {
    throw validationError("End time must be after start time", [
      { field: "endTime", message: "End time must be after start time" },
    ]);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if booking exists and get ownership
    const bookingCheck = await client.query(
      `
      SELECT b.bookingid, v.cusid
      FROM booking b
      JOIN vehicle v ON b.vehid = v.vehid
      WHERE b.bookingid = $1
      `,
      [bookingId]
    );

    if (bookingCheck.rowCount === 0) {
      throw new Error("Booking not found");
    }

    const bookingOwnerId = bookingCheck.rows[0].cusid;
    const effectiveRole = userEmptype || userRole;

    // Ownership/authorization: customers may only update their own bookings
    if (userRole === "customer" && bookingOwnerId !== userId) {
      throw new Error("You can only update your own bookings");
    }
    // Employees/managers/owners allowed

    // Validate status if provided
    if (status) {
      const validStatuses = ["pending", "inProgress", "completed", "paid"];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }
    }

    // Validate date if provided
    if (date) {
      const dateCheck = await client.query(
        "SELECT $1::date >= CURRENT_DATE as is_valid",
        [date]
      );

      if (!dateCheck.rows[0].is_valid) {
        throw new Error("Booking date must be today or in the future");
      }
    }

    // Build dynamic UPDATE query to only update provided fields
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updateFields.push(`bookingstatus = $${paramIndex}`);
      updateValues.push(status);
      paramIndex++;
    }

    if (date !== undefined) {
      updateFields.push(`bookingdate = $${paramIndex}::date`);
      updateValues.push(date);
      paramIndex++;
    }

    if (startTime !== undefined) {
      updateFields.push(`bookingstarttime = $${paramIndex}`);
      updateValues.push(startTime);
      paramIndex++;
    }

    if (endTime !== undefined) {
      updateFields.push(`bookingendtime = $${paramIndex}`);
      updateValues.push(endTime);
      paramIndex++;
    }

    // Only update if there are fields to update
    if (updateFields.length > 0) {
      updateValues.push(bookingId);
      await client.query(
        `UPDATE booking SET ${updateFields.join(
          ", "
        )} WHERE bookingid = $${paramIndex}`,
        updateValues
      );
    }

    // If services updated → validate and reset junction table
    if (services && services.length > 0) {
      const servicesCheck = await client.query(
        "SELECT serviceid FROM service WHERE serviceid = ANY($1)",
        [services]
      );

      if (servicesCheck.rowCount !== services.length) {
        throw new Error("One or more service IDs do not exist");
      }

      await client.query("DELETE FROM servicesbooked WHERE bookingid = $1", [
        bookingId,
      ]);

      for (const serviceId of services) {
        await client.query(
          `
          INSERT INTO servicesbooked (bookingid, serviceid)
          VALUES ($1, $2)
          `,
          [bookingId, serviceId]
        );
      }
    }

    await client.query("COMMIT");

    return { bookingId };
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
  userEmptype
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check ownership
    const bookingCheck = await client.query(
      `
      SELECT b.bookingid, v.cusid
      FROM booking b
      JOIN vehicle v ON b.vehid = v.vehid
      WHERE b.bookingid = $1
      `,
      [bookingId]
    );

    if (bookingCheck.rowCount === 0) {
      throw new Error("Booking not found");
    }

    const bookingOwnerId = bookingCheck.rows[0].cusid;
    const effectiveRole = userEmptype || userRole;

    if (userRole === "customer" && bookingOwnerId !== userId) {
      throw new Error("You can only delete your own bookings");
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
