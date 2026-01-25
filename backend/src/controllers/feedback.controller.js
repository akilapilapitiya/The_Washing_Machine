import {
  createFeedbackService,
  getCustomerFeedbacksService,
  getAllFeedbacksService,
} from "../services/feedback.service.js";
import { successResponse } from "../utils/response.util.js";

export const createFeedback = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { description, rating, bookingId } = req.body;

    const feedback = await createFeedbackService({
      description,
      rating,
      bookingId,
      customerId,
    });

    successResponse(res, 201, "Feedback submitted successfully", { feedback });
  } catch (error) {
    next(error);
  }
};

export const getMyFeedbacks = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const feedbacks = await getCustomerFeedbacksService(customerId);

    successResponse(res, 200, "Feedbacks retrieved successfully", {
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
export const getAllFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await getAllFeedbacksService();

    successResponse(res, 200, "All feedbacks retrieved successfully", {
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
