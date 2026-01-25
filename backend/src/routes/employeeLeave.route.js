import { Router } from "express";
import {
  createEmployeeLeave,
  getEmployeeLeaves,
} from "../controllers/employeeLeave.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const leaveRouter = Router();

leaveRouter.use(authMiddleware);

// Restricted to OWNER only as per user request
leaveRouter.post("/", restrictTo("owner"), createEmployeeLeave);
leaveRouter.get("/", restrictTo("owner"), getEmployeeLeaves);

export default leaveRouter;
