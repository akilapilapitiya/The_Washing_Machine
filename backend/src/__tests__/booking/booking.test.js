import request from "supertest";
import { jest } from "@jest/globals";

// 1. Mock Service Layer
const mockCreateBooking = jest.fn();
const mockUpdateBooking = jest.fn();
const mockDeleteBooking = jest.fn();
const mockGetAllBookings = jest.fn();
const mockGetBooking = jest.fn();

jest.unstable_mockModule("../../services/booking.service.js", () => ({
  createBookingService: mockCreateBooking,
  updateBookingService: mockUpdateBooking,
  deleteBookingService: mockDeleteBooking,
  getAllBookingsService: mockGetAllBookings,
  getBookingService: mockGetBooking,
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

// 4. Mock Env (Complete mock)
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

// 5. Import App
let createApp;
let app;

beforeAll(async () => {
  const module = await import("../../../app.js");
  createApp = module.createApp;
  app = createApp();
});

describe("Booking Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/booking", () => {
    it("should return all bookings for the user", async () => {
      const mockBookings = [{ id: 1, status: "pending" }];
      mockGetAllBookings.mockResolvedValue(mockBookings);

      const res = await request(app).get("/api/booking");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookings).toEqual(mockBookings);
    });
  });

  describe("GET /api/booking/:id", () => {
    it("should return a single booking", async () => {
      const mockBooking = { id: 1, status: "pending" };
      mockGetBooking.mockResolvedValue(mockBooking);

      const res = await request(app).get("/api/booking/1");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking).toEqual(mockBooking);
    });
  });

  describe("POST /api/booking", () => {
    it("should create a booking successfully", async () => {
      const mockBooking = { id: 1, status: "pending", date: "2024-01-01" };
      mockCreateBooking.mockResolvedValue(mockBooking);

      const res = await request(app)
        .post("/api/booking")
        .send({
          status: "pending",
          date: "2024-01-01",
          startTime: "10:00",
          vehicleId: 1,
          services: [1, 2],
          locationLatitude: 1.0,
          locationLongitude: 1.0,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking).toEqual(mockBooking);
    });
  });

  describe("PUT /api/booking/:id", () => {
    it("should update a booking successfully", async () => {
      const mockBooking = { id: 1, status: "completed" };
      mockUpdateBooking.mockResolvedValue(mockBooking);

      const res = await request(app).put("/api/booking/1").send({
        status: "completed",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking).toEqual(mockBooking);
    });
  });

  describe("DELETE /api/booking/:id", () => {
    it("should delete a booking successfully", async () => {
      mockDeleteBooking.mockResolvedValue(true);

      const res = await request(app).delete("/api/booking/1");

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);
    });
  });
});
