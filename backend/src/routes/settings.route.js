import { Router } from "express";
import {
  getPricingRules,
  updatePricingRules,
} from "../controllers/settings.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const settingsRouter = Router();

// Retrieve pricing rules (Authenticated employees/owners)
settingsRouter.get(
  "/pricing",
  authMiddleware,
  restrictTo("employee", "manager", "owner"),
  getPricingRules,
);

// Update pricing rules (Owner only)
settingsRouter.put(
  "/pricing",
  authMiddleware,
  restrictTo("owner"),
  updatePricingRules,
);

export default settingsRouter;
