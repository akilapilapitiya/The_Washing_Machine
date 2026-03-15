import logger from '../configs/logger.js';
import pool from "../configs/database.js";
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../configs/env.js";

async function resetOwnerPassword() {
  const email = "owner@washingmachine.com";
  const newPassword = "Owner@123";

  logger.info(`Resetting password for ${email} to default...`);

  try {
    const passwordHash = await bcrypt.hash(newPassword, Number(SALT_ROUNDS));

    const result = await pool.query(
      `UPDATE employee 
       SET password_hash = $1 
       WHERE email = $2
       RETURNING empid, empname, email`,
      [passwordHash, email],
    );

    if (result.rowCount > 0) {
      logger.info("✅ Password reset successful.");
      logger.info("Credentials restored:");
      logger.info(`Email: ${email}`);
      logger.info(`Password: ${newPassword}`);
    } else {
      logger.info("❌ Owner account not found.");
    }
  } catch (err) {
    logger.error("❌ Failed to update password:", err.message);
  } finally {
    process.exit();
  }
}

resetOwnerPassword();
