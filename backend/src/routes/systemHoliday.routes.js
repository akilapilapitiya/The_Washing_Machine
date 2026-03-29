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

// Protected routes
router.use(authMiddleware);

router.get("/holidays", getAllHolidaysController);
router.get("/holidays/upcoming", getUpcomingHolidaysController);
router.get("/holidays/range", getHolidaysByRangeController);
router.get("/holidays/check/:date", checkHolidayDateController);
router.get("/holidays/:id", getHolidayByIdController);

router.post("/holidays", restrictTo("owner"), createHolidayController);
router.put("/holidays/:id", restrictTo("owner"), updateHolidayController);
router.delete("/holidays/:id", restrictTo("owner"), deleteHolidayController);

router.post(
  "/holidays/sync-daily",
  restrictTo("owner", "cashier"),
  syncDailyHolidaysController,
);

export default router;
