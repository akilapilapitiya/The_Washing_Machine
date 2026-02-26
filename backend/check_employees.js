import pool from "./src/configs/database.js";

async function checkEmployees() {
  try {
    const result = await pool.query("SELECT empid, empname, emptype, telegram_chat_id FROM employee");
    console.log("Employees in DB:");
    console.table(result.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkEmployees();
