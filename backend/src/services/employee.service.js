import pool from "../configs/database.js";
import { assertAtLeastOneField } from "../utils/validation.util.js";
import { NotFoundError } from "../utils/errors.util.js";

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
    throw new NotFoundError("Employee not found");
  }

  return result.rows[0];
};

export const updateEmployeeService = async (empid, updates) => {
  // Map request body field names to database column names
  const { name, email, telephone, type, nic, password } = updates;

  // Service-layer guard: ensure at least one updatable field
  assertAtLeastOneField(updates, [
    "name",
    "email",
    "telephone",
    "type",
    "nic",
    "password",
  ]);

  // Build dynamic UPDATE query to only update provided fields
  const updateFields = [];
  const updateValues = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updateFields.push(`empname = $${paramIndex}`);
    updateValues.push(name);
    paramIndex++;
  }

  if (email !== undefined) {
    updateFields.push(`email = $${paramIndex}`);
    updateValues.push(email);
    paramIndex++;
  }

  if (telephone !== undefined) {
    updateFields.push(`emptel = $${paramIndex}`);
    updateValues.push(telephone);
    paramIndex++;
  }

  if (type !== undefined) {
    updateFields.push(`emptype = $${paramIndex}`);
    updateValues.push(type);
    paramIndex++;
  }

  if (nic !== undefined) {
    updateFields.push(`empnic = $${paramIndex}`);
    updateValues.push(nic);
    paramIndex++;
  }

  if (password !== undefined) {
    const bcrypt = await import("bcryptjs");
    const { SALT_ROUNDS } = await import("../configs/env.js");
    const passwordHash = await bcrypt.default.hash(
      password,
      Number(SALT_ROUNDS)
    );
    updateFields.push(`password_hash = $${paramIndex}`);
    updateValues.push(passwordHash);
    paramIndex++;
  }

  // Always update updated_at
  updateFields.push(`updated_at = NOW()`);

  updateValues.push(empid);

  const result = await pool.query(
    `UPDATE employee SET ${updateFields.join(
      ", "
    )} WHERE empid = $${paramIndex} RETURNING empid, empname, email, emptel, emptype, empnic, created_at, updated_at`,
    updateValues
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Employee not found");
  }

  return result.rows[0];
};

export const deleteEmployeeService = async (empid) => {
  const result = await pool.query(`DELETE FROM employee WHERE empid = $1`, [
    empid,
  ]);

  if (result.rowCount === 0) {
    throw new NotFoundError("Employee not found");
  }
};
