import request from "supertest";
import { jest } from "@jest/globals";

// 1. Mock Service Layer
const mockGetCustomer = jest.fn();
const mockUpdateCustomer = jest.fn();
const mockGetAllCustomers = jest.fn();
const mockDeleteCustomer = jest.fn();

const mockGetEmployee = jest.fn();
const mockUpdateEmployee = jest.fn();
const mockGetAllEmployees = jest.fn();
const mockDeleteEmployee = jest.fn();

jest.unstable_mockModule("../../services/customer.service.js", () => ({
  getCustomerService: mockGetCustomer,
  updateCustomerService: mockUpdateCustomer,
  getAllCustomersService: mockGetAllCustomers,
  deleteCustomerService: mockDeleteCustomer,
}));

jest.unstable_mockModule("../../services/employee.service.js", () => ({
  getEmployeeService: mockGetEmployee,
  updateEmployeeService: mockUpdateEmployee,
  getAllEmployeesService: mockGetAllEmployees,
  deleteEmployeeService: mockDeleteEmployee,
}));

// 2. Mock Middleware
const mockAuthMiddleware = jest.fn((req, res, next) => {
  // Default mock user: Owner (has access to most routes)
  req.user = { id: 1, role: "owner", emptype: null };
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

// 5. Import App
let createApp;
let app;

beforeAll(async () => {
  const module = await import("../../../app.js");
  createApp = module.createApp;
  app = createApp();
});

describe("Profile Routes (People)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Customer Profile Routes", () => {
    describe("GET /api/customer", () => {
      it("should return all customers", async () => {
        const mockCustomers = [{ cusid: 1, cusname: "John Doe" }];
        mockGetAllCustomers.mockResolvedValue(mockCustomers);

        const res = await request(app).get("/api/customer");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.customers).toEqual(mockCustomers);
      });
    });

    describe("PUT /api/customer/:cusid", () => {
      it("should update a customer profile", async () => {
        const mockCustomer = { cusid: 1, cusname: "John Updated" };
        mockUpdateCustomer.mockResolvedValue(mockCustomer);

        const res = await request(app).put("/api/customer/1").send({
          name: "John Updated",
          email: "john@example.com",
          telephone: "0771234567",
        });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.customer).toEqual(mockCustomer);
      });
    });
  });

  describe("Employee Profile Routes", () => {
    describe("GET /api/employee", () => {
      it("should return all employees", async () => {
        const mockEmployees = [{ empid: 1, empname: "Jane Staff" }];
        mockGetAllEmployees.mockResolvedValue(mockEmployees);

        const res = await request(app).get("/api/employee");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.employees).toEqual(mockEmployees);
      });
    });

    describe("PUT /api/employee/:empid", () => {
      it("should update an employee profile", async () => {
        const mockEmployee = { empid: 1, empname: "Jane Updated" };
        mockUpdateEmployee.mockResolvedValue(mockEmployee);

        const res = await request(app).put("/api/employee/1").send({
          name: "Jane Updated",
          email: "jane@staff.com",
        });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.employee).toEqual(mockEmployee);
      });
    });
  });
});
