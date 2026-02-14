import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import redis from "../../configs/redis.js";
import pool from "../../configs/database.js";
import crypto from "crypto";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;

export const initTelegramBot = () => {
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not found. Chat features disabled.");
    return;
  }

  bot = new TelegramBot(token, { polling: true });
  console.log("Telegram Bot started successfully.");

  // Handle /start (with or without code)
  bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const code = match[1];

    if (!code) {
      bot.sendMessage(
        chatId,
        "👋 Welcome to The Washing Machine Employee Bot!\n\nTo link your account:\n1. Log in to the Employee Portal.\n2. Go to your Profile.\n3. Click 'Connect Telegram'.\n4. Follow the link provided.",
      );
      return;
    }

    try {
      // Verify Code
      const employeeId = await redis.get(`telegram_link:${code}`);

      if (!employeeId) {
        bot.sendMessage(
          chatId,
          "Invalid or expired linking code. Please generate a new one from your portal.",
        );
        return;
      }

      // Link Account
      await pool.query(
        `UPDATE employee 
             SET telegram_chat_id = $1, telegram_connected_at = NOW() 
             WHERE empid = $2`,
        [chatId, employeeId],
      );

      // Cleanup
      await redis.del(`telegram_link:${code}`);

      bot.sendMessage(
        chatId,
        "✅ Account successfully linked! You will now receive notifications here.",
      );
      console.log(`Linked Telegram chat ${chatId} to Employee ${employeeId}`);
    } catch (error) {
      console.error("Telegram Linking Error:", error);
      bot.sendMessage(
        chatId,
        "❌ An error occurred while linking your account.",
      );
    }
  });

  bot.on("polling_error", (err) => console.log(err));
};

export const generateLinkingCode = async (employeeId) => {
  const code = crypto.randomBytes(4).toString("hex"); // 8 chars
  // Store in Redis with 5 min expiration
  await redis.set(`telegram_link:${code}`, employeeId, "EX", 300);
  return code;
};

export const getBot = () => bot;

export const sendMessage = async (chatId, text) => {
  if (!bot) return;
  try {
    await bot.sendMessage(chatId, text);
  } catch (error) {
    console.error("Error sending Telegram message:", error.message);
  }
};
