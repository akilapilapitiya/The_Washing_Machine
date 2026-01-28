import pool from "../configs/database.js";
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../configs/env.js";

async function resetOwnerPassword() {
  const email = "owner@washingmachine.com";
  const newPassword = "Owner@123";

  console.log(`Resetting password for ${email} to default...`);

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
      console.log("✅ Password reset successful.");
      console.log("Credentials restored:");
      console.log(`Email: ${email}`);
      console.log(`Password: ${newPassword}`);
    } else {
      console.log("❌ Owner account not found.");
    }
  } catch (err) {
    console.error("❌ Failed to update password:", err.message);
  } finally {
    process.exit();
  }
}

resetOwnerPassword();
