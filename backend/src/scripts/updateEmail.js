import pool from "../configs/database.js";

async function updateOwnerEmail() {
  const newEmail = "akilapilapitiya4@gmail.com";
  console.log(`Updating owner email to: ${newEmail}...`);

  try {
    const result = await pool.query(
      `UPDATE employee 
       SET email = $1 
       WHERE emptype = 'owner' OR roleid = (SELECT roleid FROM role WHERE rolename = 'owner')
       RETURNING empid, empname, email`,
      [newEmail],
    );

    if (result.rowCount > 0) {
      console.log("✅ Update successful:");
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
