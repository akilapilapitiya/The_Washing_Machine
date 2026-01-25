import { getDailyIncomeReportService } from "../services/report.service.js";
import { successResponse } from "../utils/response.util.js";

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
