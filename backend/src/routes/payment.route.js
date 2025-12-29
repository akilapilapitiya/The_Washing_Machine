import { Router } from "express";
import {
  createPayment,
  deletePayment,
  getAllPayments,
  getPayment,
  updatePayment,
} from "../controllers/payment.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const paymentRouter = Router();

// Protect all payment routes; managers and owners only
paymentRouter.use(authMiddleware, restrictTo("manager", "owner"));

paymentRouter.get("/:paymentid", getPayment);

// PROTECTED ROUTE - Manager/Owner only
paymentRouter.delete("/:paymentid", deletePayment);
paymentRouter.put("/:paymentid", updatePayment);
paymentRouter.post("/", createPayment);
paymentRouter.get("/", getAllPayments);

export default paymentRouter;
