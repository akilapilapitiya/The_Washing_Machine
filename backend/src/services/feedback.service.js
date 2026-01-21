import pool from "../configs/database.js";
import { assertRequiredFields } from "../utils/validation.util.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.util.js";

export const createFeedbackService = async ({
  description,
  rating,
  bookingId,
  customerId,
}) => {
  assertRequiredFields({ description, rating, bookingId }, [
    "description",
    "rating",
    "bookingId",
  ]);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure booking exists, is completed/paid, and belongs to customer
    const bookingCheck = await client.query(
      `
      SELECT b.bookingid, v.cusid, b.bookingstatus
      FROM booking b
      JOIN vehicle v ON b.vehid = v.id
      WHERE b.bookingid = $1
      `,
      [bookingId],
    );

    if (bookingCheck.rowCount === 0) {
      throw new NotFoundError("Booking not found");
    }

    const booking = bookingCheck.rows[0];

    if (booking.cusid !== customerId) {
      throw new ForbiddenError(
        "You can only provide feedback for your own bookings",
      );
    }

    const validStatuses = ["completed", "paid"];
    if (!validStatuses.includes(booking.bookingstatus)) {
      throw new ForbiddenError(
        "You can only provide feedback for completed services",
      );
    }

    // Insert feedback
    const result = await client.query(
      `
      INSERT INTO feedback (feedbackdescription, rating, bookingid, cusid)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [description, rating, bookingId, customerId],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getCustomerFeedbacksService = async (customerId) => {
  const result = await pool.query(
    `
    SELECT 
      f.*,
      v.vehbrand,
      v.vehmodel,
      v.vehplate,
      b.bookingdate,
      json_agg(s.servicename) FILTER (WHERE s.servicename IS NOT NULL) as services
    FROM feedback f
    JOIN booking b ON f.bookingid = b.bookingid
    JOIN vehicle v ON b.vehid = v.id
    LEFT JOIN servicesbooked sb ON b.bookingid = sb.bookingid
    LEFT JOIN service s ON sb.serviceid = s.serviceid
    WHERE f.cusid = $1
    GROUP BY f.feedbackid, v.vehbrand, v.vehmodel, v.vehplate, b.bookingdate
    ORDER BY f.created_at DESC
    `,
    [customerId],
  );
  return result.rows;
};
