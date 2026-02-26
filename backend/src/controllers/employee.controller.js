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

export const updateProfilePicture = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const profile_picture_url = `/uploads/profiles/${req.file.filename}`;
    const employee = await employeeService.updateEmployeeService(id, {
      profile_picture_url,
    });

    successResponse(res, 200, "Profile picture updated successfully", {
      employee,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Old password and new password are required" });
    }

    await employeeService.changePasswordService(id, oldPassword, newPassword);

    successResponse(res, 200, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req, res, next) => {
  try {
    const roles = await employeeService.getRolesService();
    successResponse(res, 200, "Roles retrieved successfully", roles);
  } catch (error) {
    next(error);
  }
};

import { generateLinkingCode } from "../modules/chat/telegram.service.js";

export const generateTelegramLink = async (req, res, next) => {
  try {
    // confirm user is employee
    if (
      req.user.role !== "employee" &&
      req.user.role !== "manager" &&
      req.user.role !== "owner" &&
      req.user.role !== "cashier"
    ) {
      return res
        .status(403)
        .json({ message: "Only employees can link Telegram." });
    }

    const code = await generateLinkingCode(req.user.id);
    successResponse(res, 200, "Linking code generated", {
      code,
      botName: process.env.TELEGRAM_BOT_NAME || "TheWashingMachineBot",
    });
  } catch (error) {
    next(error);
  }
};
