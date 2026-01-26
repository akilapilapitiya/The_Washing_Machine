import request from "supertest";
import { jest } from "@jest/globals";

// 1. Mock Modules before importing app
jest.unstable_mockModule("../../services/payment.service.js", () => ({
  createPaymentService: jest.fn(),
  getAllPaymentsService: jest.fn(),
  getCustomerPaymentsService: jest.fn(),
  getPaymentService: jest.fn(),
  updatePaymentService: jest.fn(),
  deletePaymentService: jest.fn(),
}));

// Mock Middleware
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

// Mock Database
const mockQuery = jest.fn();
jest.unstable_mockModule("../../configs/database.js", () => ({
  default: { query: mockQuery },
}));

// Mock Env
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

// Import the service after mocking
const {
  createPaymentService,
  getCustomerPaymentsService,
  getAllPaymentsService,
  getPaymentService,
  updatePaymentService,
  deletePaymentService,
} = await import("../../services/payment.service.js");

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

  describe("GET /api/payment/my", () => {
    it("should return payments for the logged-in customer", async () => {
      const mockPayments = [{ paymentid: 1, paymentamount: 50.0 }];
      getCustomerPaymentsService.mockResolvedValue(mockPayments);

      const res = await request(app).get("/api/payment/my");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(getCustomerPaymentsService).toHaveBeenCalled();
      expect(res.body.data.payments).toEqual(mockPayments);
    });
  });

  describe("GET /api/payment", () => {
    it("should return all payments for manager/owner", async () => {
      const mockPayments = [{ paymentid: 1, paymentamount: 50.0 }];
      getAllPaymentsService.mockResolvedValue(mockPayments);

      const res = await request(app).get("/api/payment");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(getAllPaymentsService).toHaveBeenCalled();
      expect(res.body.data.payments).toEqual(mockPayments);
    });
  });

  describe("GET /api/payment/:paymentid", () => {
    it("should return a specific payment", async () => {
      const mockPayment = { paymentid: 1, paymentamount: 50.0 };
      getPaymentService.mockResolvedValue(mockPayment);

      const res = await request(app).get("/api/payment/1");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(getPaymentService).toHaveBeenCalled();
      expect(res.body.data.payment).toEqual(mockPayment);
    });
  });

  describe("PUT /api/payment/:paymentid", () => {
    it("should update a payment successfully", async () => {
      const mockPayment = { paymentid: 1, paymentamount: 60.0 };
      updatePaymentService.mockResolvedValue(mockPayment);

      const res = await request(app).put("/api/payment/1").send({
        paymentamount: 60.0,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(updatePaymentService).toHaveBeenCalled();
      expect(res.body.data.payment).toEqual(mockPayment);
    });
  });

  describe("DELETE /api/payment/:paymentid", () => {
    it("should delete a payment successfully", async () => {
      deletePaymentService.mockResolvedValue();

      const res = await request(app).delete("/api/payment/1");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(deletePaymentService).toHaveBeenCalled();
    });
  });
});
