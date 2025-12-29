import {
  getPaymentService,
  getAllPaymentsService,
  getCustomerPaymentsService,
  createPaymentService,
  updatePaymentService,
  deletePaymentService,
} from "../services/payment.service.js";
import { successResponse } from "../utils/response.util.js";

export const getPayment = async (req, res, next) => {
  try {
    const { paymentid } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmptype = req.user.emptype;

    const payment = await getPaymentService(
      paymentid,
      userId,
      userRole,
      userEmptype
    );

    successResponse(res, 200, "Payment retrieved successfully", { payment });
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await getAllPaymentsService();

    successResponse(res, 200, "Payments retrieved successfully", { payments });
  } catch (error) {
    next(error);
  }
};

export const getMyPayments = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const payments = await getCustomerPaymentsService(customerId);

    successResponse(res, 200, "Payments retrieved successfully", { payments });
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const { paymentdate, paymenttype, paymentamount, bookingid } = req.body;

    const payment = await createPaymentService({
      paymentdate,
      paymenttype,
      paymentamount,
      bookingid,
    });

    successResponse(res, 201, "Payment created successfully", { payment });
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (req, res, next) => {
  try {
    const { paymentid } = req.params;
    const updates = req.body;

    const payment = await updatePaymentService(paymentid, updates);

    successResponse(res, 200, "Payment updated successfully", { payment });
  } catch (error) {
    next(error);
  }
};

export const deletePayment = async (req, res, next) => {
  try {
    const { paymentid } = req.params;
    await deletePaymentService(paymentid);

    successResponse(res, 200, "Payment deleted successfully");
  } catch (error) {
    next(error);
  }
};
