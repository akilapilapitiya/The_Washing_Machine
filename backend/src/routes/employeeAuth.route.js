import { Router } from "express";
import {
  employeeSignIn,
  employeeSignOut,
  employeeSignUp,
  requestEmployeePasswordReset,
  resetEmployeePassword,
  employeeGetMe,
  employeeGetAllRoles,
} from "../controllers/employeeAuth.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { employeeValidator } from "../validators/index.js";

const employeeAuthRouter = Router();

// Public routes
employeeAuthRouter.post(
  "/signin",
  validateSchema(employeeValidator.loginEmployee),
  employeeSignIn,
);
employeeAuthRouter.post("/signout", employeeSignOut);
employeeAuthRouter.post("/forgot-password", requestEmployeePasswordReset);
employeeAuthRouter.post("/reset-password", resetEmployeePassword);

// Protected routes
employeeAuthRouter.get("/me", authMiddleware, employeeGetMe);
employeeAuthRouter.get("/roles", authMiddleware, employeeGetAllRoles);
employeeAuthRouter.post(
  "/signup",
  authMiddleware,
  restrictTo("manager", "owner"),
  validateSchema(employeeValidator.createEmployee),
  employeeSignUp,
);
export default employeeAuthRouter;
