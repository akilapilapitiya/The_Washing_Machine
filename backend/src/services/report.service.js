import pool from "../configs/database.js";

/**
 * Get aggregated daily income report
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 */
export const getDailyIncomeReportService = async (startDate, endDate) => {
  const result = await pool.query(
    `
    SELECT 
      TO_CHAR(paymentdate, 'YYYY-MM-DD') as date, 
      COUNT(*) as transaction_count, 
      SUM(paymentamount) as total_income
    FROM payment
    WHERE paymentdate >= $1::date AND paymentdate <= $2::date
    GROUP BY paymentdate
    ORDER BY paymentdate ASC
    `,
    [startDate, endDate],
  );

  return result.rows;
};

/**
 * Get employee performance report
 * @param {string} startDate
 * @param {string} endDate
 */
export const getEmployeePerformanceReportService = async (
  startDate,
  endDate,
) => {
  const result = await pool.query(
    `
    SELECT 
      e.empid, 
      e.empname, 
      e.emptype,
      COUNT(b.bookingid) as completed_jobs,
      COALESCE(SUM(b.totalprice), 0) as total_revenue
    FROM employee e
    LEFT JOIN employeeassigned ea ON e.empid = ea.empid
    LEFT JOIN booking b ON ea.bookingid = b.bookingid 
      AND b.bookingstatus IN ('completed', 'paid')
      AND b.bookingdate >= $1::date 
      AND b.bookingdate <= $2::date
    WHERE e.emptype != 'customer'
    GROUP BY e.empid
    ORDER BY total_revenue DESC
    `,
    [startDate, endDate],
  );

  return result.rows;
};
