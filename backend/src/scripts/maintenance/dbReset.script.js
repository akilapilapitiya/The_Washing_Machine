import logger from "../../configs/logger.js";
import pool from "../../configs/database.js";
import initModels from "../../models/index.js";

// Reset database: drop all tables and recreate schema
// Use for local development only. This will DELETE ALL DATA.
export async function resetDatabase(client = pool) {
  logger.info(
    "[RESET] Starting database reset: DROP AND RECREATE ALL TABLES...",
  );

  const conn = await client.connect();
  try {
    await conn.query("BEGIN");

    // Drop all tables in reverse order of dependencies
    logger.info("[RESET] Dropping existing tables...");
    await conn.query(`
      DROP TABLE IF EXISTS servicesbooked CASCADE;
      DROP TABLE IF EXISTS payment CASCADE;
      DROP TABLE IF EXISTS schedule CASCADE;
      DROP TABLE IF EXISTS feedback CASCADE;
      DROP TABLE IF EXISTS incident CASCADE;
      DROP TABLE IF EXISTS notification CASCADE;
      DROP TABLE IF EXISTS booking_extras CASCADE;
      DROP TABLE IF EXISTS system_holidays CASCADE;
      DROP TABLE IF EXISTS employeeassigned CASCADE;
      DROP TABLE IF EXISTS employeeleave CASCADE;
      DROP TABLE IF EXISTS employeepreference CASCADE;
      DROP TABLE IF EXISTS employee_dependent CASCADE;
      DROP TABLE IF EXISTS booking CASCADE;
      DROP TABLE IF EXISTS vehicle CASCADE;
      DROP TABLE IF EXISTS vehicle_catalog CASCADE;
      DROP TABLE IF EXISTS service CASCADE;
      DROP TABLE IF EXISTS passwordresettoken CASCADE;
      DROP TABLE IF EXISTS sys_settings CASCADE;
      DROP TABLE IF EXISTS employee CASCADE;
      DROP TABLE IF EXISTS role CASCADE;
      DROP TABLE IF EXISTS advertisement CASCADE;
      DROP TABLE IF EXISTS customer CASCADE;
    `);

    await conn.query("COMMIT");
    logger.info("[RESET] All tables dropped successfully.");
  } catch (err) {
    await conn.query("ROLLBACK");
    logger.error("[RESET] Drop tables failed:", err);
    throw err;
  } finally {
    conn.release();
  }

  // Recreate all tables using models
  try {
    logger.info("[RESET] Recreating tables from models...");
    await initModels(client);
    logger.info(
      "[RESET] Database reset completed successfully. Schema recreated.",
    );
  } catch (err) {
    logger.error("[RESET] Schema recreation failed:", err);
    throw err;
  }
}
