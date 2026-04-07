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

/**
 * Get detailed daily income report (individual payments)
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 */
export const getDailyIncomeDetailedService = async (startDate, endDate) => {
  const result = await pool.query(
    `
    SELECT 
      p.paymentid,
      TO_CHAR(p.paymentdate, 'YYYY-MM-DD') as date,
      p.paymenttype,
      p.paymentamount,
      TRIM(CONCAT_WS(' ', c.title, c.first_name, c.last_name)) as cusname,
      v.vehbrand,
      v.vehmodel,
      v.vehplate,
      json_agg(DISTINCT s.servicename) FILTER (WHERE s.servicename IS NOT NULL) as services
    FROM payment p
    JOIN booking b ON p.bookingid = b.bookingid
    JOIN vehicle v ON b.vehid = v.id
    JOIN customer c ON v.cusid = c.cusid
    LEFT JOIN servicesbooked sb ON b.bookingid = sb.bookingid
    LEFT JOIN service s ON sb.serviceid = s.serviceid
    WHERE p.paymentdate::date >= $1::date AND p.paymentdate::date <= $2::date
    GROUP BY p.paymentid, c.title, c.first_name, c.last_name, v.vehbrand, v.vehmodel, v.vehplate
    ORDER BY p.paymentdate ASC, p.paymentid ASC
    `,
    [startDate, endDate],
  );

  return result.rows;
};
