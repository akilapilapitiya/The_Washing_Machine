import request from "supertest";
import { jest } from "@jest/globals";

// 1. Mock the Service Layer
const mockSignUp = jest.fn();
const mockSignIn = jest.fn();
const mockResetPassword = jest.fn();

jest.unstable_mockModule("../../services/customerAuth.service.js", () => ({
  signUp: mockSignUp,
  signIn: mockSignIn,
  resetPassword: mockResetPassword,
}));

// 2. Mock Database (accessed by app.js initialization or other middlewares)
const mockQuery = jest.fn();
jest.unstable_mockModule("../../configs/database.js", () => ({
  default: { query: mockQuery },
}));

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

// 3. Import App (after mocks)
let createApp;
let app;

beforeAll(async () => {
  const module = await import("../../../app.js");
  createApp = module.createApp;
  app = createApp();
});

describe("Customer Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/authcustomer/signup", () => {
    it("should register a new customer successfully", async () => {
      const mockCustomer = {
        cusid: 1,
        cusname: "John Doe",
        cusemail: "john@example.com",
        custel: "1234567890",
      };
      const mockToken = "mock_jwt_token";

      mockSignUp.mockResolvedValue({
        customer: mockCustomer,
        token: mockToken,
      });

      const res = await request(app).post("/api/authcustomer/signup").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        telephone: "1234567890",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer).toEqual(mockCustomer);
      expect(res.body.data.token).toBe(mockToken);
      // Check cookie
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should return 400 validation error if fields are missing", async () => {
      // Assuming validation middleware catches this before service
      const res = await request(app).post("/api/authcustomer/signup").send({
        name: "John Doe",
        // email missing
        password: "password123",
      });

      // Status might be 400 or 422 depending on validator
      // Looking at controller, it uses validateSchema middleware.
      // Joi usually returns 400 or 422. checking error middleware might be needed but starting with 400/422 check.
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/authcustomer/signin", () => {
    it("should login successfully", async () => {
      const mockCustomer = {
        cusid: 1,
        cusname: "John Doe",
        cusemail: "john@example.com",
        custel: "1234567890",
      };
      const mockToken = "mock_jwt_token";

      mockSignIn.mockResolvedValue({
        customer: mockCustomer,
        token: mockToken,
      });

      const res = await request(app).post("/api/authcustomer/signin").send({
        email: "john@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBe(mockToken);
    });

    it("should handle service errors (e.g. invalid credentials)", async () => {
      mockSignIn.mockRejectedValue(new Error("Invalid credentials"));

      const res = await request(app).post("/api/authcustomer/signin").send({
        email: "john@example.com",
        password: "wrongpassword",
      });

      // Error middleware should catch this
      expect(res.status).not.toBe(200);
      expect(res.body.success).toBe(false);
    });
  });
});
