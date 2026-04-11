import express from "express";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import {
  getDailyIncomeReport,
  getDailyIncomeDetailed,
  getMonthlyIncomeReport,
  getEmployeePerformanceReport,
} from "../controllers/report.controller.js";

const router = express.Router();

// Protected routes
router.use(authMiddleware);

router.get("/daily-income", restrictTo("owner"), getDailyIncomeReport);
router.get("/daily-income/detailed", restrictTo("owner"), getDailyIncomeDetailed);
router.get("/monthly-income", restrictTo("owner"), getMonthlyIncomeReport);

router.get(
  "/employee-performance",
  restrictTo("owner"),
  getEmployeePerformanceReport,
);

export default router;
