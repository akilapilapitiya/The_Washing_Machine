import pool from "../configs/database.js";
import { NotFoundError } from "../utils/errors.util.js";

export const getAllAdvertisementsService = async (isAdmin = false) => {
  let query = `
    SELECT * FROM advertisement 
  `;
  
  if (!isAdmin) {
    query += ` WHERE is_active = true AND status = 'active' AND (expiry_date IS NULL OR expiry_date > NOW()) `;
  }
  
  query += ` ORDER BY created_at DESC `;
  
  const result = await pool.query(query);
  return result.rows;
};

export const createAdvertisementService = async (adData) => {
  const { title, image_url, client_name, client_contact, expiry_date, status = 'active' } = adData;
  const result = await pool.query(
    `INSERT INTO advertisement (title, image_url, client_name, client_contact, expiry_date, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, image_url, client_name, client_contact, expiry_date, status]
  );
  return result.rows[0];
};

export const updateAdvertisementService = async (id, adData) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(adData)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE advertisement 
    SET ${fields.join(", ")}, updated_at = NOW() 
    WHERE id = $${idx} 
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  if (result.rowCount === 0) throw new NotFoundError("Advertisement not found");
  return result.rows[0];
};

export const deleteAdvertisementService = async (id) => {
  const result = await pool.query("DELETE FROM advertisement WHERE id = $1 RETURNING id", [id]);
  if (result.rowCount === 0) throw new NotFoundError("Advertisement not found");
  return result.rows[0];
};
