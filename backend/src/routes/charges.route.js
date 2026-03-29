import { Router } from "express";
import {
  addExtraItem,
  removeExtraItem,
  updateItemPrice,
} from "../controllers/charges.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const chargesRouter = Router();

// Protected routes
chargesRouter.use(authMiddleware);

chargesRouter.post(
  "/bookings/:id/extras",
  restrictTo("employee", "manager", "owner"),
  addExtraItem,
);

chargesRouter.delete(
  "/extras/:id",
  restrictTo("employee", "manager", "owner"),
  removeExtraItem,
);

chargesRouter.put(
  "/extras/:id/price",
  restrictTo("cashier", "manager", "owner"),
  updateItemPrice,
);

export default chargesRouter;
