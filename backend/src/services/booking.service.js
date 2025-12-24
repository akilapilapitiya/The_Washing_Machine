import pool from "../configs/database.js";

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
  userRole
}) => {
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
    if (userRole === 'customer' && vehicleCheck.rows[0].cusid !== customerId) {
      throw new Error("You can only book with your own vehicles");
    }

    // Validate status
    const validStatuses = ['pending', 'inProgress', 'completed', 'paid'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
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
        vehicleId
      ]
    );

    const bookingId = bookingResult.rows[0].bookingid;

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
export const updateBookingService = async (bookingId, updates) => {
  const {
    status,
    date,
    startTime,
    endTime,
    services
  } = updates;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Update booking main data
    await client.query(
      `
      UPDATE booking
      SET bookingstatus = $1, bookingdate = $2, bookingstarttime = $3, bookingendtime = $4
      WHERE bookingid = $5
      `,
      [status, date, startTime, endTime, bookingId]
    );

    // If services updated → reset junction table
    if (services) {
      await client.query(
        "DELETE FROM servicesbooked WHERE bookingid = $1",
        [bookingId]
      );

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
export const deleteBookingService = async (bookingId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "DELETE FROM servicesbooked WHERE bookingid = $1",
      [bookingId]
    );

    await client.query(
      "DELETE FROM booking WHERE bookingid = $1",
      [bookingId]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
