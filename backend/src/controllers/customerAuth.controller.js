import { signIn, signUp } from "../services/customerAuth.service.js";

export const customerSignUp = async (req, res, next) => {
  try {
    const { name, email, password, telephone } = req.body;

    const customer = await signUp({
      name,
      email,
      password,
      telephone,
    });

    res.status(201).json({
      status: "success",
      message: "Customer registered successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const customerSignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await signIn({ email, password });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const customerSignOut = async (req, res, next) => {
  res.status(200).json({ message: "Customer signed out" });
};
