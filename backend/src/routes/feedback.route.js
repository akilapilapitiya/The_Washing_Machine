import { Router } from "express";
import {
  createFeedback,
  getMyFeedbacks,
} from "../controllers/feedback.controller.js";
import { authMiddleware, restrictTo } from "../middleware/auth.middleware.js";

const feedbackRouter = Router();

feedbackRouter.use(authMiddleware);

feedbackRouter.post("/", restrictTo("customer"), createFeedback);
feedbackRouter.get("/my", restrictTo("customer"), getMyFeedbacks);

export default feedbackRouter;
