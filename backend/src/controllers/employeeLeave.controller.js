import * as leaveService from "../services/employeeLeave.service.js";
import { successResponse } from "../utils/response.util.js";

export const createEmployeeLeave = async (req, res, next) => {
  try {
    const { empid, startDate, endDate, reason } = req.body;
    const leave = await leaveService.createLeave({
      empid,
      startDate,
      endDate,
      reason,
    });
    successResponse(res, 201, "Employee leave recorded successfully", leave);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getAllLeaves();
    successResponse(res, 200, "Employee leaves retrieved successfully", leaves);
  } catch (error) {
    next(error);
  }
};
