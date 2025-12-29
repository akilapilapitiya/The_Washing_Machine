import { Router } from "express";
import {
  createPayment,
  deletePayment,
  getAllPayments,
  getPayment,
  getMyPayments,
  updatePayment,
} from "../controllers/payment.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { paymentValidator } from "../validators/index.js";

const paymentRouter = Router();

// Protect all payment routes
paymentRouter.use(authMiddleware);

// Customer self-service
paymentRouter.get("/my", restrictTo("customer"), getMyPayments);

// Shared access
paymentRouter.get("/:paymentid", restrictTo("customer", "manager", "owner"), getPayment);

// Manager/Owner only
paymentRouter.delete("/:paymentid", restrictTo("manager", "owner"), deletePayment);
paymentRouter.put("/:paymentid", restrictTo("manager", "owner"), validateSchema(paymentValidator.updatePayment), updatePayment);
paymentRouter.post("/", restrictTo("manager", "owner"), createPayment);
paymentRouter.get("/", restrictTo("manager", "owner"), getAllPayments);

export default paymentRouter;
