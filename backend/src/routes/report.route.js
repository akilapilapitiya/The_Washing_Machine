import express from "express";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import {
  getDailyIncomeReport,
  getEmployeePerformanceReport,
} from "../controllers/report.controller.js";

const router = express.Router();

// Protected routes
router.use(authMiddleware);

router.get("/daily-income", restrictTo("owner"), getDailyIncomeReport);

router.get(
  "/employee-performance",
  restrictTo("owner"),
  getEmployeePerformanceReport,
);

export default router;
