import { Router } from "express";
import {
  createEmployeeLeave,
  getEmployeeLeaves,
  getMyLeaves,
} from "../controllers/employeeLeave.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const leaveRouter = Router();

// Protected routes
leaveRouter.use(authMiddleware);

leaveRouter.post("/", restrictTo("owner"), createEmployeeLeave);
leaveRouter.get("/", restrictTo("owner"), getEmployeeLeaves);
leaveRouter.get("/my-leaves", restrictTo("employee"), getMyLeaves);

export default leaveRouter;
