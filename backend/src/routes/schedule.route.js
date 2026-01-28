import { Router } from "express";
import { getEmployeeSchedule } from "../controllers/schedule.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const scheduleRouter = Router();

scheduleRouter.use(authMiddleware);

// Public for all authenticated users (customers need to check availability too)
scheduleRouter.get("/employee/:empid", getEmployeeSchedule);

export default scheduleRouter;
