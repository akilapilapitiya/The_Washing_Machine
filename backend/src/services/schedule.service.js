import pool from "../configs/database.js";

/**
 * Fetch all schedule entries for a specific employee and date
 */
export const getEmployeeScheduleByDate = async (empid, date) => {
  try {
    const result = await pool.query(
      `SELECT s.scheduleid, s.schedulestarttime, s.scheduleendtime, s.bookingid, s.leaveid 
       FROM schedule s
       LEFT JOIN employeeassigned ea ON s.bookingid = ea.bookingid
       LEFT JOIN employeeleave el ON s.leaveid = el.leaveid
       WHERE (ea.empid = $1::int OR el.empid = $1::int) 
       AND s.schedulestartdate = $2::date`,
      [empid, date],
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all active bookings schedule for the entire branch by date
 */
export const getBranchBookingsByDate = async (date) => {
  try {
    const query = `
      SELECT 
        s.scheduleid, 
        s.schedulestarttime::text, 
        s.scheduleendtime::text, 
        s.bookingid, 
        b.bookingstatus,
        c.firstname AS customer_firstname,
        c.lastname AS customer_lastname,
        c.phone AS customer_phone,
        e.firstname AS employee_firstname,
        e.lastname AS employee_lastname
      FROM schedule s
      JOIN booking b ON s.bookingid = b.bookingid
      JOIN customer c ON b.customerid = c.customerid
      LEFT JOIN employeeassigned ea ON b.bookingid = ea.bookingid
      LEFT JOIN employee e ON ea.empid = e.empid
      WHERE s.schedulestartdate = $1::date
      AND b.bookingstatus NOT IN ('cancelled', 'rejected')
      ORDER BY s.schedulestarttime ASC
    `;
    const result = await pool.query(query, [date]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all leave dates for a specific employee
 */
export const getEmployeeLeaveDates = async (empid) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT s.schedulestartdate 
       FROM schedule s
       JOIN employeeleave el ON s.leaveid = el.leaveid
       WHERE el.empid = $1::int 
       AND s.schedulestartdate >= CURRENT_DATE`,
      [empid],
    );
    return result.rows.map((row) => row.schedulestartdate);
  } catch (error) {
    throw error;
  }
};

/**
 * Check if a specific time slot is available for an employee
 */
export const checkAvailability = async (
  empid,
  date,
  startTime,
  endTime,
  excludeBookingId = null,
  bufferMinutes = 0,
) => {
  const query = `
    SELECT 1 FROM schedule s
    LEFT JOIN employeeassigned ea ON s.bookingid = ea.bookingid
    LEFT JOIN employeeleave el ON s.leaveid = el.leaveid
    WHERE (ea.empid = $1::int OR el.empid = $1::int)
    AND s.schedulestartdate = $2::date
    AND (s.bookingid IS NULL OR s.bookingid != $5::int)
    AND NOT (
      s.scheduleendtime <= ($3::time - ($6 * interval '1 minute')) 
      OR 
      s.schedulestarttime >= $4::time
    )
    LIMIT 1
  `;

  const result = await pool.query(query, [
    empid,
    date,
    startTime,
    endTime,
    excludeBookingId || -1,
    bufferMinutes,
  ]);
  return result.rowCount === 0;
};

/**
 * Generate a unique 7-character schedule ID
 */
export const generateScheduleId = (prefix = "S") => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = prefix;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.substring(0, 7);
};
