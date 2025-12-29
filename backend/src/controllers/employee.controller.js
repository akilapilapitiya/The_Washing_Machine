import {
  getEmployeeService,
  getAllEmployeesService,
  updateEmployeeService,
  deleteEmployeeService,
} from "../services/employee.service.js";
import { successResponse } from "../utils/response.util.js";

export const getEmployee = async (req, res, next) => {
  try {
    const { empid } = req.params;
    const employee = await getEmployeeService(empid);

    successResponse(res, 200, "Employee retrieved successfully", { employee });
  } catch (error) {
    next(error);
  }
};

export const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await getAllEmployeesService();

    successResponse(res, 200, "Employees retrieved successfully", { employees });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { empid } = req.params;
    const updates = req.body;

    const employee = await updateEmployeeService(empid, updates);

    successResponse(res, 200, "Employee updated successfully", { employee });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { empid } = req.params;
    await deleteEmployeeService(empid);

    successResponse(res, 200, "Employee deleted successfully");
  } catch (error) {
    next(error);
  }
};
