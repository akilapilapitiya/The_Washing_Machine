import pool from "../configs/database.js";

export const createNotificationService = async ({
  recipientId,
  recipientRole,
  title,
  message,
  type = "info",
  bookingId = null,
}) => {
  const result = await pool.query(
    `INSERT INTO notification (recipient_id, recipient_role, title, message, type, booking_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [recipientId, recipientRole, title, message, type, bookingId],
  );
  return result.rows[0];
};

export const getUserNotificationsService = async (userId, userRole) => {
  const result = await pool.query(
    `SELECT * FROM notification 
     WHERE recipient_id = $1 AND recipient_role = $2
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId, userRole],
  );
  return result.rows;
};

export const markNotificationAsReadService = async (notificationId, userId) => {
  const result = await pool.query(
    `UPDATE notification 
     SET is_read = TRUE 
     WHERE id = $1 AND recipient_id = $2
     RETURNING *`,
    [notificationId, userId],
  );
  return result.rows[0];
};

export const markAllAsReadService = async (userId, userRole) => {
  await pool.query(
    `UPDATE notification 
     SET is_read = TRUE 
     WHERE recipient_id = $1 AND recipient_role = $2`,
    [userId, userRole],
  );
};
