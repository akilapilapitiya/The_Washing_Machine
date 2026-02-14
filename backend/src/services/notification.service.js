import pool from "../configs/database.js";
import { getIO } from "../socket/index.js";

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

  const notification = result.rows[0];

  // Real-time delivery (Socket.io)
  try {
    const io = getIO();
    io.to(`user-${recipientId}`).emit("notification", notification);
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }

  // Real-time delivery (Telegram)
  if (
    recipientRole === "employee" ||
    recipientRole === "manager" ||
    recipientRole === "owner" ||
    recipientRole === "cashier"
  ) {
    try {
      const empResult = await pool.query(
        `SELECT telegram_chat_id FROM employee WHERE empid = $1`,
        [recipientId],
      );

      const chatId = empResult.rows[0]?.telegram_chat_id;

      if (chatId) {
        import("../modules/chat/telegram.service.js").then(
          ({ sendMessage }) => {
            sendMessage(chatId, `🔔 *${title}*\n${message}`);
          },
        );
      }
    } catch (err) {
      console.error("Telegram notification failed:", err.message);
    }
  }

  return notification;
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
