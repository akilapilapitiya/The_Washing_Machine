import { Router } from "express";
import {
  getEmployeeSchedule,
  getBranchDailyScheduleController,
} from "../controllers/schedule.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const scheduleRouter = Router();

// Protected routes
scheduleRouter.use(authMiddleware);
scheduleRouter.get("/branch/daily", getBranchDailyScheduleController);
scheduleRouter.get("/employee/:empid", getEmployeeSchedule);

export default scheduleRouter;
