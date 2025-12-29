import pool from "../configs/database.js";
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../configs/env.js";
import { generateToken } from "../utils/generateToken.util.js";

// Signup function
export const signUp = async ({
  name,
  email,
  password,
  telephone,
  type,
  nic,
}) => {
  const existing = await pool.query(
    "SELECT empid FROM employee WHERE email = $1",
    [email]
  );

  if (existing.rowCount > 0) {
    throw new Error("Employee already exists");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, Number(SALT_ROUNDS));

  const result = await pool.query(
    `
    INSERT INTO employee (empname, email, emptel, password_hash, emptype, empnic)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING empid, empname, email, emptel, emptype, empnic
    `,
    [name, email, telephone, passwordHash, type, nic]
  );

  const employee = result.rows[0];
  const token = generateToken(employee.empid, "employee", employee.emptype);

  return { employee, token };
};

// Signin function
export const signIn = async ({ email, password }) => {
  const result = await pool.query(
    "SELECT empid, empname, email, password_hash, emptype FROM employee WHERE email = $1",
    [email]
  );

  if (result.rowCount === 0) {
    throw new Error("Invalid email or password");
  }

  const row = result.rows[0];
  const isMatch = await bcrypt.compare(password, row.password_hash);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const employee = { empid: row.empid, empname: row.empname, email: row.email };
  const token = generateToken(row.empid, "employee", row.emptype);
  return { employee, token };
};

// Reset password
export const resetPassword = async ({ email, newPassword }) => {
  if (!email || !newPassword) {
    throw new Error("Email and new password are required");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existing = await pool.query(
    "SELECT empid FROM employee WHERE email = $1",
    [email]
  );

  if (existing.rowCount === 0) {
    throw new Error("Employee not found");
  }

  const passwordHash = await bcrypt.hash(newPassword, Number(SALT_ROUNDS));

  await pool.query(
    `
    UPDATE employee
    SET password_hash = $1, updated_at = NOW()
    WHERE email = $2
    `,
    [passwordHash, email]
  );

  return { message: "Password reset successful" };
};
