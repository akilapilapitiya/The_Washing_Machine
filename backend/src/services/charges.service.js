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

export const updateExtraItemPriceService = async (extraId, price) => {
  if (price === undefined || price < 0) {
    throw new Error("Valid price is required");
  }

  const result = await pool.query(
    "UPDATE booking_extras SET price = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [price, extraId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Item not found");
  }

  return result.rows[0];
};
