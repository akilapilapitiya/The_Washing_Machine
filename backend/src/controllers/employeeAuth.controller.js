import { COOKIE_AGE, NODE_ENV } from "../configs/env.js";
import {
  signUp,
  signIn,
  resetPassword,
} from "../services/employeeAuth.service.js";

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

    res.status(201).json({
      status: "success",
      message: "Employee registered successfully",
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
    };

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * COOKIE_AGE,
    });

    res.status(200).json({
      status: "success",
      message: "Employee signed in successfully",
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
  res.status(200).json({ message: "Employee signed out" });
};
export const passwordReset = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    const result = await resetPassword({ email, newPassword });

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
