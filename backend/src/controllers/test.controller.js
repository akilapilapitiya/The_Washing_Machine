import pool from "../configs/database.js";
import { successResponse } from "../utils/response.util.js";

export const databaseConnection = async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  successResponse(res, 200, "Database connection successful", {
    database: result.rows[0].current_database,
  });
};
