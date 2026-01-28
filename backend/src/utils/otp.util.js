import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash an OTP for secure storage
 * @param {string} otp - Plain text OTP
 * @returns {Promise<string>} Hashed OTP
 */
export const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

/**
 * Verify an OTP against its hash
 * @param {string} otp - Plain text OTP to verify
 * @param {string} hash - Stored hash to compare against
 * @returns {Promise<boolean>} True if OTP matches
 */
export const verifyOTP = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};

/**
 * Log OTP to console for development/testing
 * @param {string} email - User email
 * @param {string} otp - Generated OTP
 */
export const logOTPToConsole = (email, otp) => {
  console.log("\n" + "=".repeat(50));
  console.log("🔐 PASSWORD RESET OTP");
  console.log("=".repeat(50));
  console.log(`Email: ${email}`);
  console.log(`OTP: ${otp}`);
  console.log(`Generated at: ${new Date().toLocaleString()}`);
  console.log("=".repeat(50) + "\n");
};
