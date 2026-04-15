import { Router } from "express";
import {
  getPricingRules,
  updatePricingRules,
  getReminderSettings,
  updateReminderSettings,
} from "../controllers/settings.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const settingsRouter = Router();

// Protected routes
settingsRouter.use(authMiddleware);

settingsRouter.get(
  "/pricing",
  restrictTo("employee", "manager", "owner", "customer"),
  getPricingRules,
);

settingsRouter.put("/pricing", restrictTo("owner"), updatePricingRules);

// Reminder Settings Routes
settingsRouter.get(
  "/reminders",
  restrictTo("employee", "manager", "owner", "customer"),
  getReminderSettings,
);
settingsRouter.put("/reminders", restrictTo("owner"), updateReminderSettings);

export default settingsRouter;
