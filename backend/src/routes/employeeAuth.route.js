import { Router } from "express";
import {
  employeeSignIn,
  employeeSignOut,
  employeeSignUp,
  passwordReset,
} from "../controllers/employeeAuth.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { employeeValidator } from "../validators/index.js";

const employeeAuthRouter = Router();

employeeAuthRouter.post("/signin", validateSchema(employeeValidator.loginEmployee), employeeSignIn);
employeeAuthRouter.post("/signout", employeeSignOut);
employeeAuthRouter.put("/passwordreset", passwordReset)
// PROTECTED ROUTE - Owner only
employeeAuthRouter.post(
  "/signup",
  authMiddleware,
  restrictTo("owner"),
  validateSchema(employeeValidator.createEmployee),
  employeeSignUp
);
export default employeeAuthRouter;



/*
STRUCTURRE OF EMPLOYEE ROUTES
Only the Owner Can Sign Up New Employees
 */