import { COOKIE_AGE, NODE_ENV } from "../configs/env.js";
import { signUp, signIn } from "../services/employeeAuth.service.js";

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

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * COOKIE_AGE,
    });

    res.status(200).json({
      status: "success",
      message: "Employee signed in successfully",
      employee,
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
