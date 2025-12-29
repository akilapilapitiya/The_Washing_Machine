import { Router } from "express";
import {
  employeeSignIn,
  employeeSignOut,
  employeeSignUp,
} from "../controllers/employeeAuth.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const employeeAuthRouter = Router();

employeeAuthRouter.post("/signin", employeeSignIn);
employeeAuthRouter.post("/signout", employeeSignOut);
// PROTECTED ROUTE - Owner only
employeeAuthRouter.post(
  "/signup",
  authMiddleware,
  restrictTo("owner"),
  employeeSignUp
);
export default employeeAuthRouter;



/*
STRUCTURRE OF EMPLOYEE ROUTES
Only the Owner Can Sign Up New Employees
 */