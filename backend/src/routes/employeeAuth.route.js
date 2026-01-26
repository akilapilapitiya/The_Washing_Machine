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

employeeAuthRouter.post(
  "/signin",
  validateSchema(employeeValidator.loginEmployee),
  employeeSignIn,
);
employeeAuthRouter.post("/signout", employeeSignOut);
employeeAuthRouter.post("/forgot-password", requestEmployeePasswordReset);
employeeAuthRouter.post("/reset-password", resetEmployeePassword);
employeeAuthRouter.get("/me", authMiddleware, employeeGetMe);
employeeAuthRouter.get("/roles", authMiddleware, employeeGetAllRoles);
// PROTECTED ROUTE - Owner only
employeeAuthRouter.post(
  "/signup",
  authMiddleware,
  restrictTo("owner"),
  validateSchema(employeeValidator.createEmployee),
  employeeSignUp,
);
export default employeeAuthRouter;

/*
STRUCTURRE OF EMPLOYEE ROUTES
Only the Owner Can Sign Up New Employees
 */
