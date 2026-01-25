import pool from "../configs/database.js";

const alterTable = async () => {
  try {
    await pool.query(`
      ALTER TABLE service 
      ADD COLUMN IF NOT EXISTS has_offer BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS offer_price DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS offer_description TEXT;
    `);
    console.log("service table altered successfully");
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    await pool.end();
  }
};

alterTable();
