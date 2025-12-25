import pool from "../configs/database.js";

export const getAllPaymentsService = async () => {
  const result = await pool.query(
    `
		SELECT paymentid, paymentdate, paymenttype, paymentamount, bookingid, created_at, updated_at
		FROM payment
		ORDER BY created_at DESC
		`
  );
  return result.rows;
};

export const getPaymentService = async (paymentid) => {
  const result = await pool.query(
    `
		SELECT paymentid, paymentdate, paymenttype, paymentamount, bookingid, created_at, updated_at
		FROM payment
		WHERE paymentid = $1
		`,
    [paymentid]
  );

  if (result.rowCount === 0) {
    throw new Error("Payment not found");
  }

  return result.rows[0];
};

export const createPaymentService = async ({
  paymentdate,
  paymenttype,
  paymentamount,
  bookingid,
}) => {
  // Validate paymenttype
  const validTypes = ["cash", "card", "online"];
  if (paymenttype && !validTypes.includes(paymenttype)) {
    throw new Error(
      `Invalid payment type. Must be one of: ${validTypes.join(", ")}`
    );
  }
  if (paymentamount !== undefined && Number(paymentamount) <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure booking exists
    const bookingCheck = await client.query(
      `SELECT bookingid FROM booking WHERE bookingid = $1`,
      [parseInt(bookingid)]
    );
    if (bookingCheck.rowCount === 0) {
      throw new Error("Related booking not found");
    }

    // Ensure not already paid for booking (bookingid unique in payment)
    const existing = await client.query(
      `SELECT paymentid FROM payment WHERE bookingid = $1`,
      [parseInt(bookingid)]
    );
    if (existing.rowCount > 0) {
      throw new Error("Payment already exists for this booking");
    }

    const result = await client.query(
      `
			INSERT INTO payment (paymentdate, paymenttype, paymentamount, bookingid)
			VALUES (COALESCE($1::date, CURRENT_DATE), $2, $3, $4)
			RETURNING paymentid, paymentdate, paymenttype, paymentamount, bookingid, created_at, updated_at
			`,
      [paymentdate || null, paymenttype, paymentamount, parseInt(bookingid)]
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

export const updatePaymentService = async (paymentid, updates) => {
  const { paymentdate, paymenttype, paymentamount } = updates;

  if (paymenttype !== undefined) {
    const validTypes = ["cash", "card", "online"];
    if (!validTypes.includes(paymenttype)) {
      throw new Error(
        `Invalid payment type. Must be one of: ${validTypes.join(", ")}`
      );
    }
  }
  if (paymentamount !== undefined && Number(paymentamount) <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }

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
    [paymentdate || null, paymenttype || null, paymentamount || null, paymentid]
  );

  if (result.rowCount === 0) {
    throw new Error("Payment not found");
  }

  return result.rows[0];
};

export const deletePaymentService = async (paymentid) => {
  const result = await pool.query(`DELETE FROM payment WHERE paymentid = $1`, [
    paymentid,
  ]);

  if (result.rowCount === 0) {
    throw new Error("Payment not found");
  }
};
