import pool from "../configs/database.js";

export const getAllCustomersService = async () => {
  const result = await pool.query(
    `
		SELECT cusid, cusname, cusemail, custel, created_at, updated_at
		FROM customer
		ORDER BY created_at DESC
		`
  );
  return result.rows;
};

export const getCustomerService = async (cusid) => {
  const result = await pool.query(
    `
		SELECT cusid, cusname, cusemail, custel, created_at, updated_at
		FROM customer
		WHERE cusid = $1
		`,
    [cusid]
  );

  if (result.rowCount === 0) {
    throw new Error("Customer not found");
  }

  return result.rows[0];
};

export const updateCustomerService = async (cusid, updates) => {
  const { cusname, cusemail, custel } = updates;

  // Build dynamic UPDATE query to only update provided fields
  const updateFields = [];
  const updateValues = [];
  let paramIndex = 1;

  if (cusname !== undefined) {
    updateFields.push(`cusname = $${paramIndex}`);
    updateValues.push(cusname);
    paramIndex++;
  }

  if (cusemail !== undefined) {
    updateFields.push(`cusemail = $${paramIndex}`);
    updateValues.push(cusemail);
    paramIndex++;
  }

  if (custel !== undefined) {
    updateFields.push(`custel = $${paramIndex}`);
    updateValues.push(custel);
    paramIndex++;
  }

  // Always update updated_at
  updateFields.push(`updated_at = NOW()`);

  if (updateFields.length === 1) {
    // Only updated_at would be updated, nothing else provided
    throw new Error("No fields provided for update");
  }

  updateValues.push(cusid);

  const result = await pool.query(
    `UPDATE customer SET ${updateFields.join(
      ", "
    )} WHERE cusid = $${paramIndex} RETURNING cusid, cusname, cusemail, custel, created_at, updated_at`,
    updateValues
  );

  if (result.rowCount === 0) {
    throw new Error("Customer not found");
  }

  return result.rows[0];
};

export const deleteCustomerService = async (cusid) => {
  const result = await pool.query(`DELETE FROM customer WHERE cusid = $1`, [
    cusid,
  ]);

  if (result.rowCount === 0) {
    throw new Error("Customer not found");
  }
};
