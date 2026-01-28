import request from "supertest";
import { jest } from "@jest/globals";

// 1. Mock the Service Layer
const mockSignUp = jest.fn();
const mockSignIn = jest.fn();
const mockResetPassword = jest.fn();

jest.unstable_mockModule("../../services/employeeAuth.service.js", () => ({
  signUp: mockSignUp,
  signIn: mockSignIn,
  requestPasswordReset: mockResetPassword,
  verifyOTPAndResetPassword: jest.fn(),
  getAllRoles: jest.fn(),
  getEmployeeById: jest.fn(),
}));

// 2. Mock Middleware (for protected routes)
const mockAuthMiddleware = jest.fn((req, res, next) => next());
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

// 4. Mock Env (Using the COMPLETE mock from customerAuth to avoid missing exports)
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

describe("Employee Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/authemployee/signin", () => {
    it("should login successfully", async () => {
      const mockEmployee = {
        empid: 1,
        empname: "Jane Staff",
        email: "jane@staff.com",
        emptel: "0987654321",
        type: "staff",
      };
      const mockToken = "emp_jwt_token";

      mockSignIn.mockResolvedValue({
        employee: mockEmployee,
        token: mockToken,
      });

      const res = await request(app).post("/api/authemployee/signin").send({
        email: "jane@staff.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBe(mockToken);
      expect(res.body.data.employee).toEqual(
        expect.objectContaining({
          empname: "Jane Staff",
          email: "jane@staff.com",
        }),
      );
    });

    it("should return 401/error for invalid credentials", async () => {
      mockSignIn.mockRejectedValue(new Error("Invalid credentials"));

      const res = await request(app).post("/api/authemployee/signin").send({
        email: "jane@staff.com",
        password: "wrong",
      });

      expect(res.status).not.toBe(200);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/authemployee/signout", () => {
    it("should logout successfully (clear cookie)", async () => {
      const res = await request(app).post("/api/authemployee/signout");

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/signed out/i);
      // Check for empty cookie setting
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/jwt=;/);
    });
  });

  describe("POST /api/authemployee/signup (Protected)", () => {
    it("should register new employee (mocking auth/owner check)", async () => {
      // Since we mocked authMiddleware and restrictTo to just call next(),
      // this test simulates an owner making the request successfully.
      const mockEmployee = {
        empid: 2,
        empname: "New Guy",
        email: "new@staff.com",
        type: "staff",
        nic: "123456789V",
      };
      const mockToken = "new_token";

      mockSignUp.mockResolvedValue({
        employee: mockEmployee,
        token: mockToken,
      });

      const res = await request(app).post("/api/authemployee/signup").send({
        name: "New Guy",
        email: "new@staff.com",
        password: "p@ssword1",
        telephone: "0771234567",
        type: "staff",
        nic: "123456789V",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
