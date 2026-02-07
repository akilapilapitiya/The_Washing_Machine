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

  const fuelPrice = await getSetting("fuel_price_per_km", 100); // Default 100 LKR
  const baseFee = await getSetting("base_travel_fee", 500); // Default 500 LKR

  // Formula: Base Fee + (Distance * Fuel Price)
  // Logic updated: The user said "add only fuel later I will expand".
  // Let's assume the user purely wants Distance * Cost for now, plus maybe a base fee if defined.
  // We'll stick to a simple linear model: Travel Cost = Distance * FuelPrice

  const cost = distanceKm * parseFloat(fuelPrice);
  // Add base fee if configured (optional, but good for business)
  // const total = cost + parseFloat(baseFee);

  return parseFloat(cost.toFixed(2));
};
