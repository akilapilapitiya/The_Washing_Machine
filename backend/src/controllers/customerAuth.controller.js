import { signUp, signIn } from "../services/customerAuth.service.js";
import { NODE_ENV, COOKIE_AGE } from "../configs/env.js";

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

    res.status(201).json({
      status: "success",
      message: "Customer registered successfully",
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

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * COOKIE_AGE,
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      customer,
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

  res.status(200).json({ message: "Customer signed out" });
};
