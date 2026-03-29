import * as leaveService from "../services/employeeLeave.service.js";
import { successResponse } from "../utils/response.util.js";

// CREATE Employee Leave
export const createEmployeeLeave = async (req, res, next) => {
  try {
    const { empid, startDate, endDate, reason, startTime, endTime } = req.body;
    const leave = await leaveService.createLeave({
      empid,
      startDate,
      endDate,
      reason,
      startTime,
      endTime,
    });
    successResponse(res, 201, "Employee leave recorded successfully", leave);
  } catch (error) {
    next(error);
  }
};

// GET All Employee Leaves
export const getEmployeeLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getAllLeaves();
    successResponse(res, 200, "Employee leaves retrieved successfully", leaves);
  } catch (error) {
    next(error);
  }
};

// GET My Leaves
export const getMyLeaves = async (req, res, next) => {
  try {
    const empid = req.user.id; // From auth middleware
    const leaves = await leaveService.getLeavesByEmployee(empid);
    successResponse(res, 200, "Your leaves retrieved successfully", leaves);
  } catch (error) {
    next(error);
  }
};
