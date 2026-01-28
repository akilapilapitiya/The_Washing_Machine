import request from "supertest";
import { jest } from "@jest/globals";

// 1. Mock Service Layer
const mockCreateService = jest.fn();
const mockGetAllServices = jest.fn();
const mockGetService = jest.fn();
const mockUpdateService = jest.fn();
const mockDeleteService = jest.fn();

jest.unstable_mockModule("../../services/service.service.js", () => ({
  createServiceService: mockCreateService,
  getAllServicesService: mockGetAllServices,
  getServiceService: mockGetService,
  updateServiceService: mockUpdateService,
  deleteServiceService: mockDeleteService,
}));

// 2. Mock Middleware
const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { id: 1, role: "owner", emptype: null }; // Mock as owner for create/delete access
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

describe("Service Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/service", () => {
    it("should return all services", async () => {
      const mockServices = [{ serviceid: 1, servicename: "Wash" }];
      mockGetAllServices.mockResolvedValue(mockServices);

      const res = await request(app).get("/api/service");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.services).toEqual(mockServices);
    });
  });

  describe("POST /api/service", () => {
    it("should create a service successfully", async () => {
      const mockService = { serviceid: 1, servicename: "Wash" };
      mockCreateService.mockResolvedValue(mockService);

      const res = await request(app).post("/api/service").send({
        servicename: "Wash",
        servicetime: "01:00",
        serviceprice: 100,
        servicedetails: "Basic Wash",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service).toEqual(mockService);
    });
  });

  describe("DELETE /api/service/:serviceid", () => {
    it("should delete a service successfully", async () => {
      mockDeleteService.mockResolvedValue(true);

      const res = await request(app).delete("/api/service/1");

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);
    });
  });
});
