import pool from "../configs/database.js";
import bcrypt from "bcryptjs";
import { assertAtLeastOneField } from "../utils/validation.util.js";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors.util.js";
import { SALT_ROUNDS } from "../configs/env.js";

export const getAllCustomersService = async () => {
  const result = await pool.query(
    `
    SELECT 
      c.cusid, 
      c.title,
      c.first_name, 
      c.last_name, 
      c.cusemail, 
      c.custel, 
      c.nic,
      c.dob,
      c.latitude,
      c.longitude,
      c.profile_picture_url,
      c.is_active,
      c.created_at, 
      c.updated_at,
      COUNT(b.bookingid)::int as totalbookings
    FROM customer c
    LEFT JOIN vehicle v ON c.cusid = v.cusid
    LEFT JOIN booking b ON v.id = b.vehid
    GROUP BY c.cusid
    ORDER BY c.created_at DESC
    `,
  );
  return result.rows;
};

export const getCustomerService = async (cusid) => {
  const result = await pool.query(
    `
		SELECT cusid, title, first_name, last_name, cusemail, custel, nic, dob, latitude, longitude, profile_picture_url, is_active, created_at, updated_at
		FROM customer
		WHERE cusid = $1
		`,
    [cusid],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Customer not found");
  }

  return result.rows[0];
};

export const updateCustomerService = async (cusid, updates) => {
  const updatableFields = [
    "title",
    "first_name",
    "last_name",
    "cusemail",
    "custel",
    "nic",
    "dob",
    "latitude",
    "longitude",
    "profile_picture_url",
    "is_active",
  ];

  // Service-layer guard: ensure at least one updatable field
  assertAtLeastOneField(updates, updatableFields);

  // Build dynamic UPDATE query to only update provided fields
  const updateFields = [];
  const updateValues = [];
  let paramIndex = 1;

  updatableFields.forEach((field) => {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${paramIndex}`);
      updateValues.push(updates[field]);
      paramIndex++;
    }
  });

  // Always update updated_at
  updateFields.push(`updated_at = NOW()`);

  updateValues.push(cusid);

  const result = await pool.query(
    `UPDATE customer SET ${updateFields.join(
      ", ",
    )} WHERE cusid = $${paramIndex} RETURNING cusid, title, first_name, last_name, cusemail, custel, nic, dob, latitude, longitude, profile_picture_url, is_active, created_at, updated_at`,
    updateValues,
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Customer not found");
  }

  return result.rows[0];
};

export const deleteCustomerService = async (cusid) => {
  const result = await pool.query(
    `UPDATE customer SET is_active = false, updated_at = NOW() WHERE cusid = $1`,
    [cusid],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Customer not found");
  }
};

export const changePasswordService = async (
  cusid,
  oldPassword,
  newPassword,
) => {
  // 1. Get current password hash
  const customerResult = await pool.query(
    "SELECT password_hash FROM customer WHERE cusid = $1",
    [cusid],
  );

  if (customerResult.rowCount === 0) {
    throw new NotFoundError("Customer not found");
  }

  const { password_hash } = customerResult.rows[0];

  // 2. Verify old password
  const isMatch = await bcrypt.compare(oldPassword, password_hash);
  if (!isMatch) {
    throw new UnauthorizedError("Incorrect current password");
  }

  // 3. Hash new password
  if (newPassword.length < 8) {
    throw new ValidationError("New password must be at least 8 characters");
  }
  const newHash = await bcrypt.hash(newPassword, Number(SALT_ROUNDS));

  // 4. Update password
  await pool.query(
    "UPDATE customer SET password_hash = $1, updated_at = NOW() WHERE cusid = $2",
    [newHash, cusid],
  );
};
