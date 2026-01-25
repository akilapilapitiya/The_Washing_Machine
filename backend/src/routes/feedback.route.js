import { Router } from "express";
import {
  createFeedback,
  getMyFeedbacks,
  getAllFeedbacks,
} from "../controllers/feedback.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const feedbackRouter = Router();

feedbackRouter.use(authMiddleware);

feedbackRouter.post("/", restrictTo("customer"), createFeedback);
feedbackRouter.get("/my", restrictTo("customer"), getMyFeedbacks);
feedbackRouter.get("/", restrictTo("manager", "owner"), getAllFeedbacks);

export default feedbackRouter;
