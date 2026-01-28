import { Router } from "express";
import {
  createEmployeeLeave,
  getEmployeeLeaves,
  getMyLeaves,
} from "../controllers/employeeLeave.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const leaveRouter = Router();

leaveRouter.use(authMiddleware);

// Restricted to OWNER only as per user request
leaveRouter.post("/", restrictTo("owner"), createEmployeeLeave);
leaveRouter.get("/", restrictTo("owner"), getEmployeeLeaves);

// Employee can view their own leaves
leaveRouter.get("/my-leaves", restrictTo("employee"), getMyLeaves);

export default leaveRouter;
