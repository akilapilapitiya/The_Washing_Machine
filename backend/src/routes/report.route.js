import express from "express";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { getDailyIncomeReport } from "../controllers/report.controller.js";

const router = express.Router();

// Only owners can view financial reports
router.get(
  "/daily-income",
  authMiddleware,
  restrictTo("owner"),
  getDailyIncomeReport,
);

export default router;
