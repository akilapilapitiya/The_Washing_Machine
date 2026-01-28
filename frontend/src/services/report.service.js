import api from "@/lib/api";

/**
 * Get daily income report
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD (optional)
 */
export const getDailyIncomeReport = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await api.get(`/report/daily-income?${params.toString()}`);
  return response.data?.data?.report || [];
};

/**
 * Get employee performance report
 * @param {string} startDate
 * @param {string} endDate
 */
export const getEmployeePerformanceReport = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await api.get(
    `/report/employee-performance?${params.toString()}`,
  );
  return response.data?.data?.report || [];
};
