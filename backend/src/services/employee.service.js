import pool from "../configs/database.js";
import { assertAtLeastOneField } from "../utils/validation.util.js";
import { NotFoundError } from "../utils/errors.util.js";

export const getAllEmployeesService = async () => {
  const result = await pool.query(
    `
		SELECT empid, first_name, last_name, email, emptel, emptype, empnic, 
           first_name || ' ' || last_name AS empname,
           name_with_initials, address_number, address_line1, address_line2, 
           dob, speciality, profile_picture_url, created_at, updated_at
		FROM employee
		ORDER BY created_at DESC
		`,
  );
  return result.rows;
};

export const getEmployeeService = async (empid) => {
  const result = await pool.query(
    `
		SELECT e.empid, e.first_name, e.last_name, e.email, e.emptel, e.emptype, e.empnic, 
           e.first_name || ' ' || e.last_name AS empname,
           e.name_with_initials, e.address_number, e.address_line1, e.address_line2, 
           e.dob, e.speciality, e.profile_picture_url, e.created_at, e.updated_at,
           (SELECT json_agg(d.*) FROM employee_dependent d WHERE d.empid = e.empid) as dependents
		FROM employee e
		WHERE e.empid = $1
		`,
    [empid],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Employee not found");
  }

  return result.rows[0];
};

export const getAvailableEmployeesService = async (
  date,
  startTime,
  endTime,
) => {
  const query = `
    SELECT e.empid, e.first_name || ' ' || e.last_name AS empname, e.emptype 
    FROM employee e
    WHERE e.emptype NOT IN ('owner', 'cashier')
    AND e.empid NOT IN (
      SELECT ea.empid FROM employeeassigned ea
      JOIN schedule s ON ea.bookingid = s.bookingid
      WHERE s.schedulestartdate = $1::date
      AND NOT (s.scheduleendtime <= $2::time OR s.schedulestarttime >= $3::time)
    )
    AND e.empid NOT IN (
      SELECT el.empid FROM employeeleave el 
      WHERE $1::date BETWEEN el.leavestartdate AND el.leaveenddate
    )
  `;

  const result = await pool.query(query, [date, startTime, endTime]);
  return result.rows;
};

export const updateEmployeeService = async (empid, updates) => {
  // Map request body field names to database column names
  const {
    first_name,
    last_name,
    name_with_initials,
    emptel,
    emptype,
    empnic,
    password,
    address_number,
    address_line1,
    address_line2,
    dob,
    speciality,
    profile_picture_url,
  } = updates;

  // Service-layer guard: ensure at least one updatable field
  const updatableFields = [
    "first_name",
    "last_name",
    "name_with_initials",
    "emptel",
    "emptype",
    "empnic",
    "password",
    "address_number",
    "address_line1",
    "address_line2",
    "dob",
    "speciality",
    "profile_picture_url",
  ];
  assertAtLeastOneField(updates, updatableFields);

  // Build dynamic UPDATE query to only update provided fields
  const updateFields = [];
  const updateValues = [];
  let paramIndex = 1;

  for (const field of updatableFields) {
    if (updates[field] !== undefined) {
      if (field === "password") {
        const bcrypt = await import("bcryptjs");
        const { SALT_ROUNDS } = await import("../configs/env.js");
        const passwordHash = await bcrypt.default.hash(
          updates[field],
          Number(SALT_ROUNDS),
        );
        updateFields.push(`password_hash = $${paramIndex}`);
        updateValues.push(passwordHash);
      } else {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(updates[field]);
      }
      paramIndex++;
    }
  }

  // Always update updated_at
  updateFields.push(`updated_at = NOW()`);

  updateValues.push(empid);

  const query = `
    UPDATE employee 
    SET ${updateFields.join(", ")} 
    WHERE empid = $${paramIndex} 
    RETURNING empid, first_name, last_name, email, emptel, emptype, empnic, 
              COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') AS empname,
              name_with_initials, address_number, address_line1, address_line2, 
              dob, speciality, profile_picture_url, created_at, updated_at
  `;

  const result = await pool.query(query, updateValues);

  if (result.rowCount === 0) {
    throw new NotFoundError("Employee not found");
  }

  return result.rows[0];
};

export const changePasswordService = async (
  empid,
  oldPassword,
  newPassword,
) => {
  // 1. Get current password hash
  const employeeResult = await pool.query(
    "SELECT password_hash FROM employee WHERE empid = $1",
    [empid],
  );

  if (employeeResult.rowCount === 0) {
    throw new NotFoundError("Employee not found");
  }

  const { password_hash } = employeeResult.rows[0];

  // 2. Verify old password
  const bcrypt = await import("bcryptjs");
  const isMatch = await bcrypt.default.compare(oldPassword, password_hash);
  if (!isMatch) {
    const { UnauthorizedError } = await import("../utils/errors.util.js");
    throw new UnauthorizedError("Incorrect current password");
  }

  // 3. Hash new password
  if (newPassword.length < 8) {
    const { ValidationError } = await import("../utils/errors.util.js");
    throw new ValidationError("New password must be at least 8 characters");
  }
  const { SALT_ROUNDS } = await import("../configs/env.js");
  const newHash = await bcrypt.default.hash(newPassword, Number(SALT_ROUNDS));

  // 4. Update password
  await pool.query(
    "UPDATE employee SET password_hash = $1, updated_at = NOW() WHERE empid = $2",
    [newHash, empid],
  );
};

export const deleteEmployeeService = async (empid) => {
  const result = await pool.query(`DELETE FROM employee WHERE empid = $1`, [
    empid,
  ]);

  if (result.rowCount === 0) {
    throw new NotFoundError("Employee not found");
  }
};

export const getRolesService = async () => {
  const result = await pool.query("SELECT * FROM role ORDER BY rolename ASC");
  return result.rows;
};
