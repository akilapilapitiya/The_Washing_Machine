import logger from "../../configs/logger.js";
import pool from "../../configs/database.js";

async function updateOwnerEmail() {
  const newEmail = "owner@washingmachine.com";
  logger.info(`Reverting owner email to: ${newEmail}...`);

  try {
    const result = await pool.query(
      `UPDATE employee 
       SET email = $1 
       WHERE emptype = 'owner' OR roleid = (SELECT roleid FROM role WHERE rolename = 'owner')
       RETURNING empid, empname, email`,
      [newEmail],
    );

    if (result.rowCount > 0) {
      logger.info("✅ Revert successful:");
      logger.info(result.rows[0]);
    } else {
      logger.info("❌ Owner account not found.");
    }
  } catch (err) {
    logger.error("❌ Failed to update email:", err.message);
  } finally {
    process.exit();
  }
}

updateOwnerEmail();
