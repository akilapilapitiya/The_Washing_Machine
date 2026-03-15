import logger from '../configs/logger.js';
import pool from "../configs/database.js";
import bcrypt from "bcryptjs";
import { SALT_ROUNDS, OTP_EXPIRES_IN_MINUTES } from "../configs/env.js";
import { generateToken } from "../utils/generateToken.util.js";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors.util.js";
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  logOTPToConsole,
} from "../utils/otp.util.js";
import { sendOtpEmail } from "./email.service.js";

// Signup function
export const signUp = async ({
  title,
  firstName,
  lastName,
  email,
  password,
  telephone,
  latitude,
  longitude,
}) => {
  const existing = await pool.query(
    "SELECT cusid FROM customer WHERE cusemail = $1",
    [email],
  );

  if (existing.rowCount > 0) {
    throw new AppError("Customer already exists", 409);
  }

  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, Number(SALT_ROUNDS));

  const result = await pool.query(
    `
    INSERT INTO customer (title, first_name, last_name, cusemail, custel, password_hash, latitude, longitude)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING cusid, title, first_name, last_name, cusemail, custel, latitude, longitude, profile_picture_url
    `,
    [
      title,
      firstName,
      lastName,
      email,
      telephone,
      passwordHash,
      latitude,
      longitude,
    ],
  );

  const customer = result.rows[0];
  const token = generateToken(customer.cusid, "customer");

  return { customer, token };
};

// Signin function
export const signIn = async ({ email, password }) => {
  const result = await pool.query(
    "SELECT cusid, title, first_name, last_name, cusemail, custel, nic, dob, latitude, longitude, profile_picture_url, password_hash, is_active FROM customer WHERE cusemail = $1",
    [email],
  );

  if (result.rowCount === 0) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const row = result.rows[0];
  if (!row.is_active) {
    throw new UnauthorizedError("Account Blocked. Please contact support.");
  }

  const isMatch = await bcrypt.compare(password, row.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const customer = {
    cusid: row.cusid,
    title: row.title,
    first_name: row.first_name,
    last_name: row.last_name,
    cusemail: row.cusemail,
    custel: row.custel,
    nic: row.nic,
    dob: row.dob,
    latitude: row.latitude,
    longitude: row.longitude,
    profile_picture_url: row.profile_picture_url,
  };
  const token = generateToken(row.cusid, "customer");
  return { customer, token };
};

// Request password reset - Generate and send OTP
export const requestPasswordReset = async (email) => {
  if (!email) {
    throw new ValidationError("Email is required");
  }

  // Check if customer exists (but don't reveal if they don't for security)
  const existing = await pool.query(
    "SELECT cusid FROM customer WHERE cusemail = $1",
    [email],
  );

  // Always return success message even if email doesn't exist (security best practice)
  if (existing.rowCount === 0) {
    return {
      message:
        "If an account with that email exists, a password reset OTP has been sent.",
    };
  }

  // Generate OTP
  const otp = generateOTP();
  const tokenHash = await hashOTP(otp);

  // Calculate expiration time
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000);

  // Store token in database
  await pool.query(
    `
    INSERT INTO password_reset_token (email, user_type, token_hash, expires_at)
    VALUES ($1, $2, $3, $4)
    `,
    [email, "customer", tokenHash, expiresAt],
  );

  // Log OTP to console (in production, send via email)
  logOTPToConsole(email, otp);

  // Send OTP via email (Background Job)
  try {
    await addEmailJob({
      type: "otp",
      to: email,
      data: { otp },
    });
  } catch (error) {
    logger.error("Failed to queue OTP email job:", error);
  }

  return {
    message:
      "If an account with that email exists, a password reset OTP has been sent.",
  };
};

// Verify OTP and reset password
export const verifyOTPAndResetPassword = async ({
  email,
  otp,
  newPassword,
}) => {
  if (!email || !otp || !newPassword) {
    throw new ValidationError("Email, OTP, and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  // Find the most recent unused, non-expired token for this email
  const tokenResult = await pool.query(
    `
    SELECT id, token_hash, expires_at, failed_attempts
    FROM password_reset_token
    WHERE email = $1 
      AND user_type = 'customer'
      AND is_used = FALSE
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [email],
  );

  if (tokenResult.rowCount === 0) {
    throw new UnauthorizedError("Invalid or expired OTP");
  }

  const token = tokenResult.rows[0];

  // Check if max failed attempts reached
  if (token.failed_attempts >= 3) {
    throw new UnauthorizedError(
      "Maximum OTP attempts exceeded. Please request a new OTP.",
    );
  }

  // Verify OTP
  const isValid = await verifyOTP(otp, token.token_hash);

  if (!isValid) {
    // Increment failed attempts
    await pool.query(
      `UPDATE password_reset_token SET failed_attempts = failed_attempts + 1 WHERE id = $1`,
      [token.id],
    );
    throw new UnauthorizedError("Invalid OTP");
  }

  // Mark token as used
  await pool.query(
    `UPDATE password_reset_token SET is_used = TRUE WHERE id = $1`,
    [token.id],
  );

  // Update customer password
  const passwordHash = await bcrypt.hash(newPassword, Number(SALT_ROUNDS));
  await pool.query(
    `
    UPDATE customer
    SET password_hash = $1, updated_at = NOW()
    WHERE cusemail = $2
    `,
    [passwordHash, email],
  );

  return { message: "Password reset successful" };
};
