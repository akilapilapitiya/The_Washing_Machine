import * as employeeService from "../services/employee.service.js";
import { successResponse } from "../utils/response.util.js";

export const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.getAllEmployeesService();
    successResponse(res, 200, "Employees retrieved successfully", {
      employees,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeService(id);
    successResponse(res, 200, "Employee retrieved successfully", { employee });
  } catch (error) {
    next(error);
  }
};

export const getAvailableEmployees = async (req, res, next) => {
  try {
    const { date, startTime, endTime } = req.query;
    const employees = await employeeService.getAvailableEmployeesService(
      date,
      startTime,
      endTime,
    );
    successResponse(res, 200, "Available employees retrieved", { employees });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.updateEmployeeService(id, req.body);
    successResponse(res, 200, "Employee updated successfully", { employee });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    await employeeService.deleteEmployeeService(id);
    successResponse(res, 200, "Employee deleted successfully");
  } catch (error) {
    next(error);
  }
};
