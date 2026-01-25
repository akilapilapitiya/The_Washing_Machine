import { COOKIE_AGE, NODE_ENV } from "../configs/env.js";
import {
  signUp,
  signIn,
  resetPassword,
  getEmployeeById,
} from "../services/employeeAuth.service.js";
import { successResponse } from "../utils/response.util.js";

export const employeeSignUp = async (req, res, next) => {
  try {
    const { name, email, password, telephone, type, nic } = req.body;

    const { employee, token } = await signUp({
      name,
      email,
      password,
      telephone,
      type,
      nic,
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

export const employeeSignOut = async (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "strict",
    secure: NODE_ENV === "production",
  });
  successResponse(res, 200, "Employee signed out");
};
export const passwordReset = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    const result = await resetPassword({ email, newPassword });

    successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

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
