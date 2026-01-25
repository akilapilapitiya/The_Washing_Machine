import pool from "../configs/database.js";
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../configs/env.js";
import { generateToken } from "../utils/generateToken.util.js";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors.util.js";

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
    [email],
  );

  if (existing.rowCount > 0) {
    throw new AppError("Employee already exists", 409);
  }

  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, Number(SALT_ROUNDS));

  const result = await pool.query(
    `
    INSERT INTO employee (empname, email, emptel, password_hash, emptype, empnic, roleid)
    VALUES ($1, $2, $3, $4, $5, $6, (SELECT roleid FROM role WHERE rolename = $5::VARCHAR))
    RETURNING empid, empname, email, emptel, emptype, empnic, 
      (SELECT rolename FROM role WHERE rolename = $5::VARCHAR) as rolename
    `,
    [name, email, telephone, passwordHash, type, nic],
  );

  const employee = {
    ...result.rows[0],
    emptype: result.rows[0].rolename || result.rows[0].emptype,
    role: result.rows[0].rolename,
  };
  const token = generateToken(employee.empid, "employee", employee.emptype);

  return { employee, token };
};

// Signin function
export const signIn = async ({ email, password }) => {
  const result = await pool.query(
    `
    SELECT e.empid, e.empname, e.email, e.emptel, e.password_hash, r.rolename 
    FROM employee e
    LEFT JOIN role r ON e.roleid = r.roleid
    WHERE e.email = $1
    `,
    [email],
  );

  if (result.rowCount === 0) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const row = result.rows[0];
  const isMatch = await bcrypt.compare(password, row.password_hash);

  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const employee = {
    empid: row.empid,
    empname: row.empname,
    email: row.email,
    emptel: row.emptel,
    role: row.rolename,
    emptype: row.rolename,
  };
  const token = generateToken(row.empid, "employee", row.rolename);
  return { employee, token };
};

// Reset password
export const resetPassword = async ({ email, newPassword }) => {
  if (!email || !newPassword) {
    throw new ValidationError("Email and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  const existing = await pool.query(
    "SELECT empid FROM employee WHERE email = $1",
    [email],
  );

  if (existing.rowCount === 0) {
    throw new NotFoundError("Employee not found");
  }

  const passwordHash = await bcrypt.hash(newPassword, Number(SALT_ROUNDS));

  await pool.query(
    `
    UPDATE employee
    SET password_hash = $1, updated_at = NOW()
    WHERE email = $2
    `,
    [passwordHash, email],
  );

  return { message: "Password reset successful" };
};

// Get employee by ID with role info
export const getEmployeeById = async (empid) => {
  const result = await pool.query(
    `
    SELECT e.empid, e.empname, e.email, e.emptel, r.rolename, r.is_admin
    FROM employee e
    LEFT JOIN role r ON e.roleid = r.roleid
    WHERE e.empid = $1
    `,
    [empid],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Employee not found");
  }

  return result.rows[0];
};

// Get all roles
export const getAllRoles = async () => {
  const result = await pool.query(
    "SELECT roleid, rolename, role_description, is_admin FROM role ORDER BY roleid ASC",
  );
  return result.rows;
};
