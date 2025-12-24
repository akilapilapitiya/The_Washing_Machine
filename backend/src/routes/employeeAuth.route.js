import { Router } from "express";
import {
  employeeSignIn,
  employeeSignOut,
  employeeSignUp,
} from "../controllers/employeeAuth.controller.js";

const employeeAuthRouter = Router();

employeeAuthRouter.post("/signup", employeeSignUp);
employeeAuthRouter.post("/signin", employeeSignIn);
employeeAuthRouter.post("/signout", employeeSignOut);

export default employeeAuthRouter;
