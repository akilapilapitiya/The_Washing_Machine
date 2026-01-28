import pool from "../configs/database.js";

async function updateOwnerEmail() {
  const newEmail = "owner@washingmachine.com";
  console.log(`Reverting owner email to: ${newEmail}...`);

  try {
    const result = await pool.query(
      `UPDATE employee 
       SET email = $1 
       WHERE emptype = 'owner' OR roleid = (SELECT roleid FROM role WHERE rolename = 'owner')
       RETURNING empid, empname, email`,
      [newEmail],
    );

    if (result.rowCount > 0) {
      console.log("✅ Revert successful:");
      console.log(result.rows[0]);
    } else {
      console.log("❌ Owner account not found.");
    }
  } catch (err) {
    console.error("❌ Failed to update email:", err.message);
  } finally {
    process.exit();
  }
}

updateOwnerEmail();
