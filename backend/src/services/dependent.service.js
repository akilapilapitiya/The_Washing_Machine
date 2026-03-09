import pool from "../configs/database.js";
import { NotFoundError, UnauthorizedError } from "../utils/errors.util.js";

export const getMyDependentsService = async (empid) => {
  const result = await pool.query(
    "SELECT * FROM employee_dependent WHERE empid = $1 ORDER BY created_at DESC",
    [empid],
  );
  return result.rows;
};

export const addDependentService = async (empid, data) => {
  const { name, relationship, contact_number, is_emergency_contact } = data;

  const result = await pool.query(
    `INSERT INTO employee_dependent (empid, name, relationship, contact_number, is_emergency_contact)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [empid, name, relationship, contact_number, is_emergency_contact],
  );

  return result.rows[0];
};

export const removeDependentService = async (depid, empid) => {
  // Verify ownership before deletion
  const checkResult = await pool.query(
    "SELECT empid FROM employee_dependent WHERE depid = $1",
    [depid],
  );

  if (checkResult.rowCount === 0) {
    throw new NotFoundError("Dependent not found");
  }

  if (checkResult.rows[0].empid !== empid) {
    throw new UnauthorizedError("You can only remove your own dependents");
  }

  await pool.query("DELETE FROM employee_dependent WHERE depid = $1", [depid]);
};
