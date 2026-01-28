import request from "supertest";
import { jest } from "@jest/globals";

// 1. Mock Service Layer
const mockCreateFeedback = jest.fn();
const mockGetCustomerFeedbacks = jest.fn();

jest.unstable_mockModule("../../services/feedback.service.js", () => ({
  createFeedbackService: mockCreateFeedback,
  getCustomerFeedbacksService: mockGetCustomerFeedbacks,
  getAllFeedbacksService: jest.fn(),
}));

// 2. Mock Middleware
const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { id: 1, role: "customer", emptype: null }; // Default mock user
  next();
});
const mockRestrictTo = jest.fn(
  (...roles) =>
    (req, res, next) =>
      next(),
);

jest.unstable_mockModule("../../middleware/auth.middleware.js", () => ({
  authMiddleware: mockAuthMiddleware,
  restrictTo: mockRestrictTo,
}));

// 3. Mock Database
const mockQuery = jest.fn();
jest.unstable_mockModule("../../configs/database.js", () => ({
  default: { query: mockQuery },
}));

// 4. Mock Env
jest.unstable_mockModule("../../configs/env.js", () => ({
  NODE_ENV: "test",
  COOKIE_AGE: 1,
  PORT: 3000,
  DB_USER: "test",
  DB_HOST: "localhost",
  DB_NAME: "testdb",
  DB_PORT: 5432,
  DB_PASSWORD: "test",
  JWT_SECRET: "testsecret",
  JWT_EXPIRES_IN: "1h",
  SALT_ROUNDS: 10,
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX_REQUESTS: 100,
  RATE_LIMIT_AUTH_MAX: 5,
  OTP_EXPIRES_IN_MINUTES: 10,
}));

// 5. Import App
let createApp;
let app;

beforeAll(async () => {
  const module = await import("../../../app.js");
  createApp = module.createApp;
  app = createApp();
});

describe("Feedback Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/feedback", () => {
    it("should submit feedback successfully", async () => {
      const mockFeedback = { feedbackId: 1, description: "Great!" };
      mockCreateFeedback.mockResolvedValue(mockFeedback);

      const res = await request(app).post("/api/feedback").send({
        description: "Great service!",
        rating: 5,
        bookingId: 1,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.feedback).toEqual(mockFeedback);
    });
  });

  describe("GET /api/feedback/my-feedbacks", () => {
    it("should return feedbacks for the logged-in customer", async () => {
      const mockFeedbacks = [{ feedbackId: 1, rating: 5 }];
      mockGetCustomerFeedbacks.mockResolvedValue(mockFeedbacks);

      const res = await request(app).get("/api/feedback/my");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.feedbacks).toEqual(mockFeedbacks);
    });
  });
});
