import logger from "../configs/logger.js";
import pool from "../configs/database.js";

// Cache for settings (simple in-memory cache for now)
let settingsCache = {};
let lastCacheTime = 0;
const CACHE_TTL = 60000 * 5; // 5 minutes

const getSetting = async (key, defaultValue) => {
  const now = Date.now();
  if (settingsCache[key] && now - lastCacheTime < CACHE_TTL) {
    return settingsCache[key];
  }

  const result = await pool.query(
    "SELECT value FROM sys_settings WHERE key = $1",
    [key],
  );

  if (result.rowCount > 0) {
    settingsCache[key] = result.rows[0].value;
    lastCacheTime = now;
    return result.rows[0].value;
  }

  return defaultValue;
};

export const calculateTravelCost = async (distanceKm) => {
  if (distanceKm <= 0) return 0;

  // Default rules if DB fetch fails or is empty
  const defaultRules = {
    base_km: 5,
    base_fee: 500,
    additional_rate: 100,
  };

  let rules = defaultRules;
  try {
    const rulesJson = await getSetting("travel_pricing_rules", null);
    if (rulesJson) {
      rules = JSON.parse(rulesJson);
    }
  } catch (error) {
    logger.warn("Failed to parse pricing rules, using defaults", error);
  }

  const { base_km, base_fee, additional_rate } = rules;

  let cost = 0;

  if (distanceKm <= base_km) {
    cost = parseFloat(base_fee);
  } else {
    // Base cost + (extra distance * rate)
    const extraKm = distanceKm - base_km;
    cost = parseFloat(base_fee) + extraKm * parseFloat(additional_rate);
  }

  return parseFloat(cost.toFixed(2));
};
