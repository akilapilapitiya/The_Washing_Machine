import * as scheduleService from "../services/schedule.service.js";
import { successResponse } from "../utils/response.util.js";

export const getEmployeeSchedule = async (req, res, next) => {
  try {
    const { empid } = req.params;
    const { date } = req.query;

    // If empid is "any", we treat it as no specific schedule restrictions for now
    if (empid === "any") {
      return successResponse(res, 200, "Global availability check", []);
    }

    // Basic validation
    if (!empid || isNaN(parseInt(empid))) {
      return res.status(400).json({
        success: false,
        message: "Invalid Operative ID provided",
      });
    }

    if (date) {
      const schedule = await scheduleService.getEmployeeScheduleByDate(
        empid,
        date,
      );
      return successResponse(res, 200, "Schedule retrieved", schedule);
    }

    // Default: return blocked dates (leaves)
    const leaveDates = await scheduleService.getEmployeeLeaveDates(empid);
    successResponse(res, 200, "Blocked dates retrieved", leaveDates);
  } catch (error) {
    next(error);
  }
};
