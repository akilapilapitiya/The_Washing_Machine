import pool from "../configs/database.js";

const updateSchema = async () => {
  const client = await pool.connect();
  try {
    console.log("Starting database schema update...");
    await client.query("BEGIN");

    // 1. Create sys_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sys_settings (
        key VARCHAR(50) PRIMARY KEY,
        value VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);
    console.log("Verified sys_settings table.");

    // 2. Insert default settings
    await client.query(`
      INSERT INTO sys_settings (key, value, description) VALUES 
      ('fuel_price_per_km', '100', 'Cost of fuel per kilometer in LKR'),
      ('base_travel_fee', '500', 'Base fee for any home visit')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log("Inserted default settings.");

    // 3. Update booking table
    await client.query(`
      ALTER TABLE booking 
      ADD COLUMN IF NOT EXISTS travel_distance DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS travel_duration INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS travel_cost DECIMAL(10,2) DEFAULT 0;
    `);
    console.log("Updated booking table schema.");

    await client.query("COMMIT");
    console.log("Schema update completed successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Schema update failed:", err);
  } finally {
    client.release();
    process.exit();
  }
};

updateSchema();
