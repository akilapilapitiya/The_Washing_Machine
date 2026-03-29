import pool from "../configs/database.js";
import { NotFoundError } from "../utils/errors.util.js";

export const addExtraItemService = async (bookingId, userId, itemData) => {
  const { item_name, description } = itemData;

  if (!item_name) {
    throw new Error("Item name is required");
  }

  const result = await pool.query(
    `INSERT INTO booking_extras (booking_id, item_name, description, added_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
    [bookingId, item_name, description, userId],
  );

  return result.rows[0];
};

export const removeExtraItemService = async (extraId) => {
  const result = await pool.query(
    "DELETE FROM booking_extras WHERE id = $1 RETURNING *",
    [extraId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Item not found");
  }

  return result.rows[0];
};

export const updateExtraItemPriceService = async (extraId, price, userId) => {
  if (price === undefined || price < 0) {
    throw new Error("Valid price is required");
  }

  const result = await pool.query(
    `UPDATE booking_extras 
     SET price = $1, priced_by = $2, priced_at = NOW(), updated_at = NOW() 
     WHERE id = $3 
     RETURNING *`,
    [price, userId, extraId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Item not found");
  }

  return result.rows[0];
};

export const updateServicePriceService = async (bookingId, serviceId, price) => {
  if (price === undefined || price < 0) {
    throw new Error("Valid price is required");
  }

  const result = await pool.query(
    `UPDATE servicesbooked 
     SET service_price_at_booking = $1
     WHERE bookingid = $2 AND serviceid = $3 
     RETURNING *`,
    [price, bookingId, serviceId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Service not found for this booking");
  }

  return result.rows[0];
};
