import pool from "./src/configs/database.js";

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'employee'
      ORDER BY ordinal_position;
    `);
    console.log("Employee Table Columns:");
    console.table(result.rows);

    const empCount = await pool.query("SELECT COUNT(*) FROM employee");
    console.log(`Total employees: ${empCount.rows[0].count}`);

    if (empCount.rows[0].count > 0) {
        const samples = await pool.query("SELECT * FROM employee LIMIT 5");
        console.log("Sample Data (First 5):");
        console.table(samples.rows);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
