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
    WHERE paymentdate::date >= $1::date AND paymentdate::date <= $2::date
    GROUP BY 1
    ORDER BY 1 ASC
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
      e.first_name || ' ' || e.last_name as empname, 
      e.emptype,
      COUNT(b.bookingid) as completed_jobs,
      COALESCE(SUM(b.totalprice), 0) as total_revenue
    FROM employee e
    LEFT JOIN employeeassigned ea ON e.empid = ea.empid
    LEFT JOIN booking b ON ea.bookingid = b.bookingid 
      AND b.bookingstatus IN ('completed', 'paid')
      AND (
        (b.bookingdate::date >= $1::date AND b.bookingdate::date <= $2::date)
        OR 
        (b.updated_at::date >= $1::date AND b.updated_at::date <= $2::date AND b.bookingstatus IN ('completed', 'paid'))
      )
    WHERE e.emptype != 'customer'
    GROUP BY e.empid, e.first_name, e.last_name, e.emptype
    ORDER BY total_revenue DESC
    `,
    [startDate, endDate],
  );

  return result.rows;
};
