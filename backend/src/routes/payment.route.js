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

// Protected routes
paymentRouter.use(authMiddleware);

paymentRouter.get("/my", restrictTo("customer"), getMyPayments);

paymentRouter.get(
  "/:paymentid",
  restrictTo("customer", "cashier", "owner"),
  getPayment,
);

paymentRouter.delete("/:paymentid", restrictTo("owner"), deletePayment);
paymentRouter.put(
  "/:paymentid",
  restrictTo("cashier", "owner"),
  validateSchema(paymentValidator.updatePayment),
  updatePayment,
);
paymentRouter.post("/", restrictTo("cashier", "owner"), createPayment);
paymentRouter.get("/", restrictTo("cashier", "owner"), getAllPayments);

export default paymentRouter;
