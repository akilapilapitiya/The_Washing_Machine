import pool from "../configs/database.js";
import { generateScheduleId } from "./schedule.service.js";
import { AppError, ValidationError } from "../utils/errors.util.js";

/**
 * Record a leave for an employee and block their schedule
 */
export const createLeave = async ({ empid, startDate, endDate, reason }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verify existence
    const empCheck = await client.query(
      "SELECT empid FROM employee WHERE empid = $1",
      [empid],
    );
    if (empCheck.rowCount === 0) {
      throw new AppError("Employee not found", 404);
    }

    // 2. Check for conflicts with existing bookings
    // We check if the employee is assigned to any booking during the leave period
    const conflictCheck = await client.query(
      `SELECT b.bookingid, b.bookingdate 
       FROM booking b
       JOIN employeeassigned ea ON b.bookingid = ea.bookingid
       WHERE ea.empid = $1 
       AND b.bookingdate BETWEEN $2::date AND $3::date`,
      [empid, startDate, endDate],
    );

    if (conflictCheck.rowCount > 0) {
      throw new ValidationError(
        `Employee has ${conflictCheck.rowCount} booking(s) assigned during this period.`,
      );
    }

    // 3. Create Leave record
    const leaveResult = await client.query(
      `INSERT INTO employeeleave (leavestartdate, leaveenddate, leavereason, empid)
       VALUES ($1, $2, $3, $4)
       RETURNING leaveid`,
      [startDate, endDate, reason, empid],
    );
    const leaveId = leaveResult.rows[0].leaveid;

    // 4. Populate Schedule (One entry per day of leave)
    // We block the whole day 00:00 to 23:59
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = d.toISOString().split("T")[0];
      const scheduleId = generateScheduleId("L");

      await client.query(
        `INSERT INTO schedule (scheduleid, schedulestartdate, scheduleenddate, schedulestarttime, scheduleendtime, leaveid)
         VALUES ($1, $2, $2, '00:00:00', '23:59:59', $3)`,
        [scheduleId, currentDate, leaveId],
      );
    }

    await client.query("COMMIT");
    return { leaveId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * List all leaves
 */
export const getAllLeaves = async () => {
  const result = await pool.query(
    `SELECT el.*, e.empname 
     FROM employeeleave el
     JOIN employee e ON el.empid = e.empid
     ORDER BY el.leavestartdate DESC`,
  );
  return result.rows;
};

/**
 * Get leaves for a specific employee
 */
export const getLeavesByEmployee = async (empid) => {
  const result = await pool.query(
    `SELECT el.*, e.empname 
     FROM employeeleave el
     JOIN employee e ON el.empid = e.empid
     WHERE el.empid = $1
     ORDER BY el.leavestartdate DESC`,
    [empid],
  );
  return result.rows;
};
