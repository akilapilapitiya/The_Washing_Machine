import request from "supertest";
import { jest } from "@jest/globals";

// 1. Mock Service Layer
const mockCreateVehicle = jest.fn();
const mockGetAllVehiclesByRole = jest.fn(); // getCustomerVehicles uses this
const mockGetVehicle = jest.fn();
const mockUpdateVehicle = jest.fn();
const mockDeleteVehicle = jest.fn();

jest.unstable_mockModule("../../services/vehicle.service.js", () => ({
  createVehicleService: mockCreateVehicle,
  getAllVehiclesByRoleService: mockGetAllVehiclesByRole,
  getVehicleService: mockGetVehicle,
  updateVehicleService: mockUpdateVehicle,
  deleteVehicleService: mockDeleteVehicle,
  getCustomerVehiclesService: jest.fn(), // Not used directly by controller exports named getCustomerVehicles logic
}));

// 2. Mock Middleware
const mockAuthMiddleware = jest.fn((req, res, next) => {
  req.user = { id: 1, role: "customer", emptype: null }; // Mock as customer
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

describe("Vehicle Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/vehicle", () => {
    it("should return all vehicles for the user", async () => {
      const mockVehicles = [{ vehid: 1, vehplate: "ABC-1234" }];
      mockGetAllVehiclesByRole.mockResolvedValue(mockVehicles);

      const res = await request(app).get("/api/vehicle");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicles).toEqual(mockVehicles);
    });
  });

  describe("POST /api/vehicle", () => {
    it("should create a vehicle successfully", async () => {
      const mockVehicle = { vehid: 1, vehplate: "ABC-1234" };
      mockCreateVehicle.mockResolvedValue(mockVehicle);

      const res = await request(app).post("/api/vehicle").send({
        vehplate: "ABC-1234",
        vehmileage: 1000,
        vehbrand: "Toyota",
        vehmodel: "Corolla",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vehicle).toEqual(mockVehicle);
    });
  });

  describe("PUT /api/vehicle/:id", () => {
    it("should update vehicle mileage", async () => {
      const mockVehicle = { vehid: 1, vehmileage: 2000 };
      mockUpdateVehicle.mockResolvedValue(mockVehicle);

      const res = await request(app).put("/api/vehicle/1").send({
        vehmileage: 2000,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /api/vehicle/:id", () => {
    it("should delete a vehicle successfully", async () => {
      mockDeleteVehicle.mockResolvedValue(true);

      const res = await request(app).delete("/api/vehicle/1");

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);
    });
  });
});
