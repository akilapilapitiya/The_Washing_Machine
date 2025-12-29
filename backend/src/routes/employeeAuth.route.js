import { Router } from "express";
import {
  employeeSignIn,
  employeeSignOut,
  employeeSignUp,
} from "../controllers/employeeAuth.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const employeeAuthRouter = Router();

// PROTECTED ROUTE - Owner only: Create new employee accounts
employeeAuthRouter.post("/signup", authMiddleware, restrictTo('owner'), employeeSignUp);
employeeAuthRouter.post("/signin", employeeSignIn);
employeeAuthRouter.post("/signout", employeeSignOut);

export default employeeAuthRouter;
