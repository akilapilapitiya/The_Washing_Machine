import pool from "../configs/database.js";
import { assertAtLeastOneField } from "../utils/validation.util.js";
import { NotFoundError } from "../utils/errors.util.js";

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
