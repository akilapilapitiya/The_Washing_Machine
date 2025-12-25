import {
  getEmployeeService,
  getAllEmployeesService,
  updateEmployeeService,
  deleteEmployeeService,
} from "../services/employee.service.js";

export const getEmployee = async (req, res, next) => {
  try {
    const { empid } = req.params;
    const employee = await getEmployeeService(empid);

    res.status(200).json({
      status: "success",
      message: "Employee retrieved successfully",
      employee,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await getAllEmployeesService();

    res.status(200).json({
      status: "success",
      message: "Employees retrieved successfully",
      employees,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { empid } = req.params;
    const updates = req.body;

    const employee = await updateEmployeeService(empid, updates);

    res.status(200).json({
      status: "success",
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { empid } = req.params;
    await deleteEmployeeService(empid);

    res.status(200).json({
      status: "success",
      message: "Employee deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
