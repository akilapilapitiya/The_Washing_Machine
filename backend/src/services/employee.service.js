import pool from "../configs/database.js";

export const getAllEmployeesService = async () => {
  const result = await pool.query(
    `
		SELECT empid, empname, email, emptel, emptype, empnic, created_at, updated_at
		FROM employee
		ORDER BY created_at DESC
		`
  );
  return result.rows;
};

export const getEmployeeService = async (empid) => {
  const result = await pool.query(
    `
		SELECT empid, empname, email, emptel, emptype, empnic, created_at, updated_at
		FROM employee
		WHERE empid = $1
		`,
    [empid]
  );

  if (result.rowCount === 0) {
    throw new Error("Employee not found");
  }

  return result.rows[0];
};

export const updateEmployeeService = async (empid, updates) => {
  const { empname, email, emptel, emptype, empnic } = updates;

  // Build dynamic UPDATE query to only update provided fields
  const updateFields = [];
  const updateValues = [];
  let paramIndex = 1;

  if (empname !== undefined) {
    updateFields.push(`empname = $${paramIndex}`);
    updateValues.push(empname);
    paramIndex++;
  }

  if (email !== undefined) {
    updateFields.push(`email = $${paramIndex}`);
    updateValues.push(email);
    paramIndex++;
  }

  if (emptel !== undefined) {
    updateFields.push(`emptel = $${paramIndex}`);
    updateValues.push(emptel);
    paramIndex++;
  }

  if (emptype !== undefined) {
    updateFields.push(`emptype = $${paramIndex}`);
    updateValues.push(emptype);
    paramIndex++;
  }

  if (empnic !== undefined) {
    updateFields.push(`empnic = $${paramIndex}`);
    updateValues.push(empnic);
    paramIndex++;
  }

  // Always update updated_at
  updateFields.push(`updated_at = NOW()`);

  if (updateFields.length === 1) {
    // Only updated_at would be updated, nothing else provided
    throw new Error("No fields provided for update");
  }

  updateValues.push(empid);

  const result = await pool.query(
    `UPDATE employee SET ${updateFields.join(
      ", "
    )} WHERE empid = $${paramIndex} RETURNING empid, empname, email, emptel, emptype, empnic, created_at, updated_at`,
    updateValues
  );

  if (result.rowCount === 0) {
    throw new Error("Employee not found");
  }

  return result.rows[0];
};

export const deleteEmployeeService = async (empid) => {
  const result = await pool.query(`DELETE FROM employee WHERE empid = $1`, [
    empid,
  ]);

  if (result.rowCount === 0) {
    throw new Error("Employee not found");
  }
};
