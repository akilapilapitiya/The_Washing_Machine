import pool from "../configs/database.js";

const migrate = async () => {
  try {
    console.log("Migrating service table...");
    await pool.query(`
      ALTER TABLE service 
      ADD COLUMN IF NOT EXISTS servicetype VARCHAR(20) DEFAULT 'package';
    `);
    console.log("Successfully added servicetype column.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
