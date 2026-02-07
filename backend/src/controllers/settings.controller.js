import pool from "../configs/database.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.util.js";

// GET /api/settings/pricing
export const getPricingRules = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT value FROM sys_settings WHERE key = 'travel_pricing_rules'",
    );

    let rules = {
      base_km: 5,
      base_fee: 500,
      additional_rate: 100,
    };

    if (result.rowCount > 0) {
      rules = JSON.parse(result.rows[0].value);
    }

    res.json(rules);
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings/pricing
export const updatePricingRules = async (req, res, next) => {
  try {
    const { base_km, base_fee, additional_rate } = req.body;

    // Basic Validation
    if (
      base_km === undefined ||
      base_fee === undefined ||
      additional_rate === undefined
    ) {
      throw new Error(
        "Missing required fields: base_km, base_fee, additional_rate",
      );
    }

    const rules = {
      base_km: Number(base_km),
      base_fee: Number(base_fee),
      additional_rate: Number(additional_rate),
    };

    await pool.query(
      `INSERT INTO sys_settings (key, value, description) 
       VALUES ($1, $2, $3)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = NOW()`,
      [
        "travel_pricing_rules",
        JSON.stringify(rules),
        "Configuration for travel cost calculation: { base_km, base_fee, additional_rate }",
      ],
    );

    res.json({ message: "Pricing rules updated successfully", rules });
  } catch (error) {
    next(error);
  }
};
