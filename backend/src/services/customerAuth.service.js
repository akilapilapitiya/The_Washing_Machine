import pool from "../configs/database.js";
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../configs/env.js";
import { generateToken } from "../utils/generateToken.util.js";

// Signup function
export const signUp = async ({ name, email, password, telephone }) => {
  const existing = await pool.query(
    "SELECT cusid FROM customer WHERE cusemail = $1",
    [email]
  );

  if (existing.rowCount > 0) {
    throw new Error("Customer already exists");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, Number(SALT_ROUNDS));

  const result = await pool.query(
    `
    INSERT INTO customer (cusname, cusemail, custel, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING cusid, cusname, cusemail, custel
    `,
    [name, email, telephone, passwordHash]
  );

  const customer = result.rows[0];
  const token = generateToken(customer.cusid, "customer");

  return { customer, token };
};

// Signin function
export const signIn = async ({ email, password }) => {
  const result = await pool.query(
    "SELECT cusid, cusname, cusemail, password_hash FROM customer WHERE cusemail = $1",
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

  const customer = { cusid: row.cusid, cusname: row.cusname, cusemail: row.cusemail };
  const token = generateToken(row.cusid, "customer");
  return { customer, token };
};
