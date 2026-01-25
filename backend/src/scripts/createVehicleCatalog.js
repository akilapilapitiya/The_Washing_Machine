import pool from "../configs/database.js";

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicle_catalog (
        id SERIAL PRIMARY KEY,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(brand, model)
      );
    `);
    console.log("vehicle_catalog table created successfully");

    // Seed some initial data
    await pool.query(`
      INSERT INTO vehicle_catalog (brand, model) VALUES 
      ('Toyota', 'Corolla'),
      ('Toyota', 'Camry'),
      ('Honda', 'Civic'),
      ('Honda', 'Accord'),
      ('Nissan', 'Leaf')
      ON CONFLICT (brand, model) DO NOTHING;
    `);
    console.log("Initial data seeded");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await pool.end();
  }
};

createTable();
