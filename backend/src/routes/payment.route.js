import { Router } from "express";
import { createPayment, deletePayment, getAllPayments, getPayment, updatePayment } from "../controllers/payment.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const paymentRouter = Router();

// Protect all payment routes; employees only
paymentRouter.use(authMiddleware, restrictTo("employee"));

paymentRouter.get("/", getAllPayments);
paymentRouter.post("/", createPayment);
paymentRouter.get("/:paymentid", getPayment);
paymentRouter.put("/:paymentid", updatePayment);
paymentRouter.delete("/:paymentid", deletePayment);

export default paymentRouter;
