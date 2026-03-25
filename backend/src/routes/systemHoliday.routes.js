import express from "express";
import {
  getAllHolidaysController,
  getHolidaysByRangeController,
  checkHolidayDateController,
  getHolidayByIdController,
  createHolidayController,
  updateHolidayController,
  deleteHolidayController,
  getUpcomingHolidaysController,
  syncDailyHolidaysController,
} from "../controllers/systemHoliday.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (accessible to all authenticated users)
router.get("/holidays", authMiddleware, getAllHolidaysController);
router.get("/holidays/upcoming", authMiddleware, getUpcomingHolidaysController);
router.get("/holidays/range", authMiddleware, getHolidaysByRangeController);
router.get("/holidays/check/:date", authMiddleware, checkHolidayDateController);
router.get("/holidays/:id", authMiddleware, getHolidayByIdController);

// Owner-only routes
router.post(
  "/holidays",
  authMiddleware,
  restrictTo("owner"),
  createHolidayController,
);
router.put(
  "/holidays/:id",
  authMiddleware,
  restrictTo("owner"),
  updateHolidayController,
);
router.delete(
  "/holidays/:id",
  authMiddleware,
  restrictTo("owner"),
  restrictTo("owner"),
  deleteHolidayController,
);

// Sync daily holidays
router.post(
  "/holidays/sync-daily",
  authMiddleware,
  restrictTo("owner"),
  syncDailyHolidaysController,
);

export default router;
