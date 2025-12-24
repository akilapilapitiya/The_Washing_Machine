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
  const token = generateToken(employee.empid, 'employee');

  return { employee, token };
};

// Signin function
export const signIn = async ({ email, password }) => {
  const result = await pool.query(
    "SELECT empid, empname, email, password_hash FROM employee WHERE email = $1",
    [email]
  );

  if (result.rowCount === 0) {
    throw new Error("Invalid email or password");
  }

  const employee = result.rows[0];
  const isMatch = await bcrypt.compare(password, employee.password_hash);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(employee.empid, 'employee');
  return { employee, token };
};
