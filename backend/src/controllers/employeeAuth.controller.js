import { COOKIE_AGE, NODE_ENV } from "../configs/env.js";
import {
  signUp,
  signIn,
  requestPasswordReset,
  verifyOTPAndResetPassword,
  getEmployeeById,
  getAllRoles,
} from "../services/employeeAuth.service.js";
import { successResponse } from "../utils/response.util.js";

// Employee Sign Up
export const employeeSignUp = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      name_with_initials,
      email,
      password,
      telephone,
      type,
      nic,
      address_number,
      address_line1,
      address_line2,
      dob,
      speciality,
    } = req.body;

    const { employee, token } = await signUp({
      first_name,
      last_name,
      name_with_initials,
      email,
      password,
      telephone,
      type,
      nic,
      address_number,
      address_line1,
      address_line2,
      dob,
      speciality,
    });

    // Set token as httpOnly cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * COOKIE_AGE,
    });

    successResponse(res, 201, "Employee registered successfully", {
      employee,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Employee Sign In
export const employeeSignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { employee, token } = await signIn({ email, password });

    const safeEmployee = {
      empid: employee.empid,
      empname: employee.empname,
      email: employee.email,
      emptel: employee.emptel,
      role: employee.role,
      emptype: employee.emptype,
      profile_picture_url: employee.profile_picture_url,
    };

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * COOKIE_AGE,
    });

    successResponse(res, 200, "Employee signed in successfully", {
      employee: safeEmployee,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Employee Sign Out
export const employeeSignOut = async (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "strict",
    secure: NODE_ENV === "production",
  });
  successResponse(res, 200, "Employee signed out");
};

export const requestEmployeePasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await requestPasswordReset(email);

    successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

// Reset Employee Password
export const resetEmployeePassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const result = await verifyOTPAndResetPassword({ email, otp, newPassword });

    successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

// GET Employee Profile
export const employeeGetMe = async (req, res, next) => {
  try {
    const employee = await getEmployeeById(req.user.id);

    // Normalize properties for frontend
    const data = {
      ...employee,
      role: employee.rolename,
      emptype: employee.rolename,
      isAdmin: employee.is_admin, // Definitve admin flag
    };

    successResponse(res, 200, "Employee retrieved successfully", data);
  } catch (error) {
    next(error);
  }
};

// UPDATE Employee Roles
export const employeeGetAllRoles = async (req, res, next) => {
  try {
    const roles = await getAllRoles();
    successResponse(res, 200, "Roles retrieved successfully", roles);
  } catch (error) {
    next(error);
  }
};
