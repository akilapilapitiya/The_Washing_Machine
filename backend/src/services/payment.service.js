import pool from "../configs/database.js";
import {
  assertAtLeastOneField,
  assertEnum,
  assertPositiveNumber,
  assertRequiredFields,
} from "../utils/validation.util.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.util.js";

export const getAllPaymentsService = async () => {
  const result = await pool.query(
    `
		SELECT paymentid, paymentdate, paymenttype, paymentamount, bookingid, created_at, updated_at
		FROM payment
		ORDER BY created_at DESC
		`,
  );
  return result.rows;
};

export const getPaymentService = async (
  paymentid,
  userId,
  userRole,
  userEmptype,
) => {
  const result = await pool.query(
    `
		SELECT p.paymentid, p.paymentdate, p.paymenttype, p.paymentamount, p.bookingid, p.created_at, p.updated_at,
           v.cusid
		FROM payment p
      JOIN booking b ON p.bookingid = b.bookingid
      JOIN vehicle v ON b.vehid = v.vehid
		WHERE p.paymentid = $1
		`,
    [paymentid],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Payment not found");
  }

  const payment = result.rows[0];
  const effectiveRole = userEmptype || userRole;

  // Customers can only view their own payments
  if (userRole === "customer" && payment.cusid !== userId) {
    throw new ForbiddenError("You can only view your own payments");
  }

  // Managers/Owners (and any other elevated roles) can view all
  if (effectiveRole === "manager" || effectiveRole === "owner") {
    return payment;
  }

  // If role is employee (non manager/owner) block access
  if (
    userRole === "employee" &&
    effectiveRole !== "manager" &&
    effectiveRole !== "owner"
  ) {
    throw new ForbiddenError("You do not have permission to view this payment");
  }

  return payment;
};

export const getCustomerPaymentsService = async (customerId) => {
  const result = await pool.query(
    `
    SELECT 
      p.paymentid, 
      p.paymentdate, 
      p.paymenttype, 
      p.paymentamount, 
      p.bookingid, 
      p.created_at, 
      p.updated_at,
      v.vehbrand,
      v.vehmodel,
      v.vehplate,
      json_agg(s.servicename) FILTER (WHERE s.servicename IS NOT NULL) as services
    FROM payment p
    JOIN booking b ON p.bookingid = b.bookingid
    JOIN vehicle v ON b.vehid = v.id
    LEFT JOIN servicesbooked sb ON b.bookingid = sb.bookingid
    LEFT JOIN service s ON sb.serviceid = s.serviceid
    WHERE v.cusid = $1
    GROUP BY p.paymentid, v.vehbrand, v.vehmodel, v.vehplate
    ORDER BY p.created_at DESC
    `,
    [customerId],
  );

  return result.rows;
};

export const createPaymentService = async ({
  paymentdate,
  paymenttype,
  paymentamount,
  bookingid,
}) => {
  const validTypes = ["cash", "card", "online"];
  assertRequiredFields({ paymentamount, bookingid, paymenttype }, [
    "paymentamount",
    "bookingid",
    "paymenttype",
  ]);
  assertEnum(paymenttype, "paymenttype", validTypes);
  assertPositiveNumber(paymentamount, "paymentamount");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure booking exists
    const bookingCheck = await client.query(
      `SELECT bookingid FROM booking WHERE bookingid = $1`,
      [parseInt(bookingid)],
    );
    if (bookingCheck.rowCount === 0) {
      throw new NotFoundError("Related booking not found");
    }

    // Ensure not already paid for booking (bookingid unique in payment)
    const existing = await client.query(
      `SELECT paymentid FROM payment WHERE bookingid = $1`,
      [parseInt(bookingid)],
    );
    if (existing.rowCount > 0) {
      throw new ForbiddenError("Payment already exists for this booking");
    }

    const result = await client.query(
      `
			INSERT INTO payment (paymentdate, paymenttype, paymentamount, bookingid)
			VALUES (COALESCE($1::date, CURRENT_DATE), $2, $3, $4)
			RETURNING paymentid, paymentdate, paymenttype, paymentamount, bookingid, created_at, updated_at
			`,
      [paymentdate || null, paymenttype, paymentamount, parseInt(bookingid)],
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

// Customer-facing payment creation with ownership check
export const updatePaymentService = async (paymentid, updates) => {
  const { paymentdate, paymenttype, paymentamount } = updates;
  const validTypes = ["cash", "card", "online"];
  assertAtLeastOneField(updates, [
    "paymentdate",
    "paymenttype",
    "paymentamount",
  ]);
  assertEnum(paymenttype, "paymenttype", validTypes);
  assertPositiveNumber(paymentamount, "paymentamount");

  const result = await pool.query(
    `
		UPDATE payment
		SET paymentdate = COALESCE($1::date, paymentdate),
				paymenttype = COALESCE($2, paymenttype),
				paymentamount = COALESCE($3, paymentamount),
				updated_at = NOW()
		WHERE paymentid = $4
		RETURNING paymentid, paymentdate, paymenttype, paymentamount, bookingid, created_at, updated_at
		`,
    [
      paymentdate || null,
      paymenttype || null,
      paymentamount || null,
      paymentid,
    ],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Payment not found");
  }

  return result.rows[0];
};

export const deletePaymentService = async (paymentid) => {
  const result = await pool.query(`DELETE FROM payment WHERE paymentid = $1`, [
    paymentid,
  ]);

  if (result.rowCount === 0) {
    throw new NotFoundError("Payment not found");
  }
};
