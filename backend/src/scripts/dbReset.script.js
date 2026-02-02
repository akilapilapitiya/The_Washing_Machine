import pool from "../configs/database.js";
import initModels from "../models/index.js";

// Reset database: drop all tables and recreate schema
// Use for local development only. This will DELETE ALL DATA.
export async function resetDatabase(client = pool) {
  console.log(
    "[RESET] Starting database reset: DROP AND RECREATE ALL TABLES...",
  );

  const conn = await client.connect();
  try {
    await conn.query("BEGIN");

    // Drop all tables in reverse order of dependencies
    console.log("[RESET] Dropping existing tables...");
    await conn.query(`
      DROP TABLE IF EXISTS passwordresettoken CASCADE;
      DROP TABLE IF EXISTS notification CASCADE;
      DROP TABLE IF EXISTS incident CASCADE;
      DROP TABLE IF EXISTS employee_dependent CASCADE;
      DROP TABLE IF EXISTS servicesbooked CASCADE;
      DROP TABLE IF EXISTS payment CASCADE;
      DROP TABLE IF EXISTS schedule CASCADE;
      DROP TABLE IF EXISTS feedback CASCADE;
      DROP TABLE IF EXISTS employeeassigned CASCADE;
      DROP TABLE IF EXISTS employeeleave CASCADE;
      DROP TABLE IF EXISTS employeepreference CASCADE;
      DROP TABLE IF EXISTS booking CASCADE;
      DROP TABLE IF EXISTS vehicle CASCADE;
      DROP TABLE IF EXISTS vehiclecatalog CASCADE;
      DROP TABLE IF EXISTS service CASCADE;
      DROP TABLE IF EXISTS employee CASCADE;
      DROP TABLE IF EXISTS role CASCADE;
      DROP TABLE IF EXISTS customer CASCADE;
    `);

    await conn.query("COMMIT");
    console.log("[RESET] All tables dropped successfully.");
  } catch (err) {
    await conn.query("ROLLBACK");
    console.error("[RESET] Drop tables failed:", err);
    throw err;
  } finally {
    conn.release();
  }

  // Recreate all tables using models
  try {
    console.log("[RESET] Recreating tables from models...");
    await initModels(client);
    console.log(
      "[RESET] Database reset completed successfully. Schema recreated.",
    );
  } catch (err) {
    console.error("[RESET] Schema recreation failed:", err);
    throw err;
  }
}
