import {
  signUp,
  signIn,
  requestPasswordReset,
  verifyOTPAndResetPassword,
} from "../services/customerAuth.service.js";
import { NODE_ENV, COOKIE_AGE } from "../configs/env.js";
import { successResponse } from "../utils/response.util.js";

export const customerSignUp = async (req, res, next) => {
  try {
    const { name, email, password, telephone } = req.body;

    const { customer, token } = await signUp({
      name,
      email,
      password,
      telephone,
    });

    // Set cookie in controller
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * COOKIE_AGE,
    });

    successResponse(res, 201, "Customer registered successfully", {
      customer,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const customerSignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { customer, token } = await signIn({ email, password });

    const safeCustomer = {
      cusid: customer.cusid,
      cusname: customer.cusname,
      cusemail: customer.cusemail,
      custel: customer.custel,
    };

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * COOKIE_AGE,
    });

    successResponse(res, 200, "Login successful", {
      customer: safeCustomer,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const customerSignOut = async (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "strict",
    secure: NODE_ENV === "production",
  });

  successResponse(res, 200, "Customer signed out");
};

export const requestCustomerPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await requestPasswordReset(email);

    successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

export const resetCustomerPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const result = await verifyOTPAndResetPassword({ email, otp, newPassword });

    successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};
