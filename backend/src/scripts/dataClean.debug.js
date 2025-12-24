import pool from "../configs/database.js";

// Debug utility: truncate all app tables safely
// Use for local test/dev only. This will wipe ALL data.
export async function cleanAllData(client = pool) {
  console.log("[DEBUG] Starting database clean: TRUNCATE ALL APP TABLES...");
  const sql = `
    TRUNCATE TABLE
      servicesbooked,
      payment,
      schedule,
      feedback,
      employeeassigned,
      employeeleave,
      employeepreference,
      booking,
      vehicle,
      service,
      employee,
      customer
    RESTART IDENTITY CASCADE;
  `;
  const conn = await client.connect();
  try {
    await conn.query("BEGIN");
    await conn.query(sql);
    await conn.query("COMMIT");
    console.log("[DEBUG] Database clean completed successfully.");
  } catch (err) {
    await conn.query("ROLLBACK");
    console.error("[DEBUG] Database clean failed:", err);
    throw err;
  } finally {
    conn.release();
  }
}
