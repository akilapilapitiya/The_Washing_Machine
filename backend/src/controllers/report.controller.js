import {
  getDailyIncomeReportService,
  getEmployeePerformanceReportService,
} from "../services/report.service.js";
import { successResponse } from "../utils/response.util.js";

// GET Daily Income Report
export const getDailyIncomeReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const report = await getDailyIncomeReportService(
      startDate ||
        new Date(new Date().setDate(new Date().getDate() - 30))
          .toISOString()
          .split("T")[0], // Default 30 days ago
      endDate || new Date().toISOString().split("T")[0], // Default today
    );

    successResponse(res, 200, "Daily income report retrieved", { report });
  } catch (error) {
    next(error);
  }
};

// GET Employee Performance Report
export const getEmployeePerformanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const report = await getEmployeePerformanceReportService(
      startDate ||
        new Date(new Date().setDate(new Date().getDate() - 30))
          .toISOString()
          .split("T")[0],
      endDate || new Date().toISOString().split("T")[0],
    );

    successResponse(res, 200, "Employee performance report retrieved", {
      report,
    });
  } catch (error) {
    next(error);
  }
};
