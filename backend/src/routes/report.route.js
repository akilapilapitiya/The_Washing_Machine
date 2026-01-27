import express from "express";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import {
  getDailyIncomeReport,
  getEmployeePerformanceReport,
} from "../controllers/report.controller.js";

const router = express.Router();

// Only owners can view financial reports
router.get(
  "/daily-income",
  authMiddleware,
  restrictTo("owner"),
  getDailyIncomeReport,
);

router.get(
  "/employee-performance",
  authMiddleware,
  restrictTo("owner"),
  getEmployeePerformanceReport,
);

export default router;
