import request from "supertest";
import { jest } from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule("../configs/database.js", () => ({
  default: { query: mockQuery },
}));

let createApp;

beforeAll(async () => {
  const module = await import("../../app.js");
  createApp = module.createApp;
});
describe("GET /api/db", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it("returns the current database name", async () => {
    mockQuery.mockResolvedValue({
      rows: [{ current_database: "wash_test_db" }],
    });

    const app = createApp();
    const res = await request(app).get("/api/db");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Database connection successful",
      data: { database: "wash_test_db" },
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith("SELECT current_database()");
  });
});
