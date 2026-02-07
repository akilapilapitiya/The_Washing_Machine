import { Router } from "express";
import {
  addExtraItem,
  removeExtraItem,
  updateItemPrice,
} from "../controllers/charges.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const chargesRouter = Router();

// Add Item (Employee, Owner)
chargesRouter.post(
  "/bookings/:id/extras",
  authMiddleware,
  restrictTo("employee", "manager", "owner"),
  addExtraItem,
);

// Remove Item (Employee, Owner)
chargesRouter.delete(
  "/extras/:id",
  authMiddleware,
  restrictTo("employee", "manager", "owner"),
  removeExtraItem,
);

// Update Price (Cashier, Owner, Manager)
chargesRouter.put(
  "/extras/:id/price",
  authMiddleware,
  restrictTo("cashier", "manager", "owner"),
  updateItemPrice,
);

export default chargesRouter;
