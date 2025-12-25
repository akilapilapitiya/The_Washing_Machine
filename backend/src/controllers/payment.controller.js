import {
	getPaymentService,
	getAllPaymentsService,
	createPaymentService,
	updatePaymentService,
	deletePaymentService
} from "../services/payment.service.js";

export const getPayment = async (req, res, next) => {
	try {
		const { paymentid } = req.params;
		const payment = await getPaymentService(paymentid);

		res.status(200).json({
			status: "success",
			message: "Payment retrieved successfully",
			payment
		});
	} catch (error) {
		next(error);
	}
};

export const getAllPayments = async (req, res, next) => {
	try {
		const payments = await getAllPaymentsService();

		res.status(200).json({
			status: "success",
			message: "Payments retrieved successfully",
			payments
		});
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
			bookingid
		});

		res.status(201).json({
			status: "success",
			message: "Payment created successfully",
			payment
		});
	} catch (error) {
		next(error);
	}
};

export const updatePayment = async (req, res, next) => {
	try {
		const { paymentid } = req.params;
		const updates = req.body;

		const payment = await updatePaymentService(paymentid, updates);

		res.status(200).json({
			status: "success",
			message: "Payment updated successfully",
			payment
		});
	} catch (error) {
		next(error);
	}
};

export const deletePayment = async (req, res, next) => {
	try {
		const { paymentid } = req.params;
		await deletePaymentService(paymentid);

		res.status(200).json({
			status: "success",
			message: "Payment deleted successfully"
		});
	} catch (error) {
		next(error);
	}
};