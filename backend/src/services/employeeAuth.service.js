import logger from "../configs/logger.js";
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
import { addEmailJob } from "../queue/email.queue.js";
import { sendOtpEmail } from "./email.service.js";

// Signup function
export const signUp = async ({
  first_name,
  last_name,
  name_with_initials,
  email,
  password,
  telephone,
  type,
  nic,
  address_number,
  address_line1,
  address_line2,
  dob,
  speciality,
}) => {
  const existing = await pool.query(
    "SELECT empid FROM employee WHERE email = $1",
    [email],
  );

  if (existing.rowCount > 0) {
    throw new AppError("Employee already exists", 409);
  }

  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, Number(SALT_ROUNDS));

  const result = await pool.query(
    `
    INSERT INTO employee (
      first_name, last_name, name_with_initials, email, emptel, 
      password_hash, emptype, empnic, address_number, address_line1, 
      address_line2, dob, speciality, roleid
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, (SELECT roleid FROM role WHERE rolename = $7::VARCHAR))
    RETURNING empid, first_name, last_name, email, emptel, emptype, empnic, 
      first_name || ' ' || last_name AS empname,
      (SELECT rolename FROM role WHERE rolename = $7::VARCHAR) as rolename
    `,
    [
      first_name,
      last_name,
      name_with_initials,
      email,
      telephone,
      passwordHash,
      type,
      nic,
      address_number,
      address_line1,
      address_line2,
      dob,
      speciality,
    ],
  );

  const employee = {
    ...result.rows[0],
    emptype: result.rows[0].rolename || result.rows[0].emptype,
    role: result.rows[0].rolename,
  };
  const token = generateToken(employee.empid, "employee", employee.emptype);

  // Send the professional welcome email with their un-hashed password
  try {
    await addEmailJob({
      type: "welcome",
      to: email,
      data: {
        password: password,
        loginUrl: "https://washingmachine.truegate.live/employee-login",
      },
    });
  } catch (error) {
    logger.error("Failed to queue welcome email:", error);
  }

  return { employee, token };
};

// Signin function
export const signIn = async ({ email, password }) => {
  const result = await pool.query(
    `
    SELECT e.empid, e.first_name, e.last_name, e.email, e.emptel, e.password_hash, 
           e.first_name || ' ' || e.last_name AS empname, r.rolename, e.profile_picture_url 
    FROM employee e
    LEFT JOIN role r ON e.roleid = r.roleid
    WHERE e.email = $1
    `,
    [email],
  );

  if (result.rowCount === 0) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const row = result.rows[0];
  const isMatch = await bcrypt.compare(password, row.password_hash);

  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const employee = {
    empid: row.empid,
    empname: row.empname,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    emptel: row.emptel,
    role: row.rolename,
    emptype: row.rolename,
    profile_picture_url: row.profile_picture_url,
  };
  const token = generateToken(row.empid, "employee", row.rolename);
  return { employee, token };
};

// Request password reset - Generate and send OTP
export const requestPasswordReset = async (email) => {
  if (!email) {
    throw new ValidationError("Email is required");
  }

  // Check if employee exists (but don't reveal if they don't for security)
  const existing = await pool.query(
    "SELECT empid FROM employee WHERE email = $1",
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
    [email, "employee", tokenHash, expiresAt],
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
    // Fail silently, error is logged
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
      AND user_type = 'employee'
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

  // Update employee password
  const passwordHash = await bcrypt.hash(newPassword, Number(SALT_ROUNDS));
  await pool.query(
    `
    UPDATE employee
    SET password_hash = $1, updated_at = NOW()
    WHERE email = $2
    `,
    [passwordHash, email],
  );

  return { message: "Password reset successful" };
};

// Get employee by ID with role info
export const getEmployeeById = async (empid) => {
  const result = await pool.query(
    `
    SELECT e.empid, e.first_name, e.last_name, e.email, e.emptel, r.rolename, r.is_admin,
           e.first_name || ' ' || e.last_name AS empname,
           e.name_with_initials, e.address_number, e.address_line1, e.address_line2, 
           e.dob, e.speciality, e.profile_picture_url, e.created_at, e.updated_at,
           e.telegram_chat_id IS NOT NULL AS has_telegram,
           (SELECT json_agg(d.*) FROM employee_dependent d WHERE d.empid = e.empid) as dependents
    FROM employee e
    LEFT JOIN role r ON e.roleid = r.roleid
    WHERE e.empid = $1
    `,
    [empid],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Employee not found");
  }

  return result.rows[0];
};

// Get all roles
export const getAllRoles = async () => {
  const result = await pool.query(
    "SELECT roleid, rolename, role_description, is_admin FROM role ORDER BY roleid ASC",
  );
  return result.rows;
};
