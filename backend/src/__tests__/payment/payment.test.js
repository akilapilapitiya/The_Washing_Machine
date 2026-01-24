import request from "supertest";
import { jest } from "@jest/globals";

// Use the manual mock
jest.unstable_mockModule(
  "../../services/payment.service.js",
  () => import("../../services/__mocks__/payment.service.js"),
);

// Import the mocks to control them
const {
  createPaymentService,
  getAllPaymentsService,
  getCustomerPaymentsService,
} = await import("../../services/payment.service.js");

// 2. Mock Middleware
const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { id: 1, role: "customer", emptype: null };
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
}));

let createApp;
let app;

beforeAll(async () => {
  const module = await import("../../../app.js");
  createApp = module.createApp;
  app = createApp();
});

describe("Payment Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/payment", () => {
    it("should create a payment successfully", async () => {
      const mockPayment = { paymentid: 1, paymentamount: 50.0 };
      createPaymentService.mockResolvedValue(mockPayment);

      const res = await request(app).post("/api/payment").send({
        paymentdate: "2024-01-01",
        paymenttype: "card",
        paymentamount: 50.0,
        bookingid: 1,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment).toEqual(mockPayment);
    });
  });

  describe("GET /api/payment/my-payments", () => {
    it("should return payments for the logged-in customer", async () => {
      const mockPayments = [{ paymentid: 1, paymentamount: 50.0 }];
      getCustomerPaymentsService.mockResolvedValue(mockPayments);

      const res = await request(app).get("/api/payment/my-payments");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(getCustomerPaymentsService).toHaveBeenCalled();
      expect(res.body.data.payments).toEqual(mockPayments);
    });
  });
});
