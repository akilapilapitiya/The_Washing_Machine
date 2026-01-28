import pool from "../configs/database.js";

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incident (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER, -- Allowing null in case user is deleted? No, keep it specific. But FK constraint can fail if we don't have tables. assuming tables exist.
        customer_id INTEGER,
        booking_id INTEGER,
        description TEXT NOT NULL,
        severity VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("incident table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await pool.end();
  }
};

createTable();
