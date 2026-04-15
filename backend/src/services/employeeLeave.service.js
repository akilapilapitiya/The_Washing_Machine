import pool from "../configs/database.js";
import { generateScheduleId } from "./schedule.service.js";
import { AppError, ValidationError } from "../utils/errors.util.js";
import { createNotificationService } from "./notification.service.js";

/**
 * Record a leave for an employee and block their schedule
 */
export const createLeave = async ({
  empid,
  startDate,
  endDate,
  reason,
  startTime = null,
  endTime = null,
}) => {
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
    let conflictCheckQuery = `
       SELECT b.bookingid, b.bookingdate 
       FROM booking b
       JOIN employeeassigned ea ON b.bookingid = ea.bookingid
       WHERE ea.empid = $1 
       AND b.bookingdate BETWEEN $2::date AND $3::date`;
    let queryParams = [empid, startDate, endDate];

    if (startTime && endTime) {
      conflictCheckQuery += ` AND NOT (b.bookingendtime <= $4::time OR b.bookingstarttime >= $5::time)`;
      queryParams.push(startTime, endTime);
    }

    const conflictCheck = await client.query(conflictCheckQuery, queryParams);

    if (conflictCheck.rowCount > 0) {
      throw new ValidationError(
        `Employee has ${conflictCheck.rowCount} booking(s) assigned during this period.`,
      );
    }

    // 3. Create Leave record
    const leaveResult = await client.query(
      `INSERT INTO employeeleave (leavestartdate, leaveenddate, leavereason, empid, leavestarttime, leaveendtime)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING leaveid`,
      [startDate, endDate, reason, empid, startTime, endTime],
    );
    const leaveId = leaveResult.rows[0].leaveid;

    // 4. Populate Schedule (One entry per day of leave)
    const start = new Date(startDate);
    const end = new Date(endDate);

    const sTime = startTime || "00:00:00";
    const eTime = endTime || "23:59:59";

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = d.toISOString().split("T")[0];
      const scheduleId = generateScheduleId("L");

      await client.query(
        `INSERT INTO schedule (scheduleid, schedulestartdate, scheduleenddate, schedulestarttime, scheduleendtime, leaveid)
         VALUES ($1, $2, $2, $3, $4, $5)`,
        [scheduleId, currentDate, sTime, eTime, leaveId],
      );
    }

    await client.query("COMMIT");

    // Notification
    await createNotificationService({
      recipientId: empid,
      recipientRole: "employee", // or 'employee' depending on system
      title: "Leave Recorded",
      message: `Your leave from ${startDate} to ${endDate} has been recorded.`,
      type: "success",
    });

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
    `SELECT el.*, e.first_name || ' ' || e.last_name AS empname 
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
    `SELECT el.*, e.first_name || ' ' || e.last_name AS empname 
     FROM employeeleave el
     JOIN employee e ON el.empid = e.empid
     WHERE el.empid = $1
     ORDER BY el.leavestartdate DESC`,
    [empid],
  );
  return result.rows;
};
