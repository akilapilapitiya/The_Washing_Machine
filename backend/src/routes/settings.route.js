import { Router } from "express";
import {
  getPricingRules,
  updatePricingRules,
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

export default settingsRouter;
