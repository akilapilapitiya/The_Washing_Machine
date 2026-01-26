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
