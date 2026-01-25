import pool from "../configs/database.js";
import { successResponse } from "../utils/response.util.js";
import { ValidationError, ConflictError } from "../utils/errors.util.js";

export const getCatalog = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vehicle_catalog ORDER BY brand ASC, model ASC",
    );
    successResponse(res, 200, "Catalog retrieved successfully", result.rows);
  } catch (error) {
    next(error);
  }
};

export const addToCatalog = async (req, res, next) => {
  try {
    const { brand, model } = req.body;

    if (!brand) {
      throw new ValidationError("Brand is required");
    }

    try {
      const result = await pool.query(
        "INSERT INTO vehicle_catalog (brand, model) VALUES ($1, $2) RETURNING *",
        [brand, model],
      );
      successResponse(res, 201, "Vehicle added to catalog", result.rows[0]);
    } catch (dbError) {
      if (dbError.code === "23505") {
        // Unique violation
        throw new ConflictError(
          "This brand and model combination already exists",
        );
      }
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
};

export const removeFromCatalog = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM vehicle_catalog WHERE id = $1", [id]);
    successResponse(res, 200, "Vehicle removed from catalog");
  } catch (error) {
    next(error);
  }
};
