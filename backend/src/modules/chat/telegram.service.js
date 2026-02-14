import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import redis from "../../configs/redis.js";
import pool from "../../configs/database.js";
import crypto from "crypto";

import {
  getAllBookingsService,
  getBookingService,
  updateBookingService,
} from "../../services/booking.service.js";

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

  // Set Persistent Menu
  bot.setMyCommands([
    { command: "/start", description: "Link Account" },
    { command: "/jobs", description: "View Assigned Jobs" },
  ]);

  // Handle linking (both /start <CODE> and just <CODE>)
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (!text) return;

    // Persistent Menu Button Handler
    if (text === "📅 My Jobs" || text === "/jobs") {
      await handleJobsCommand(chatId);
      return;
    }

    // Check if it's a simple start command
    if (text === "/start") {
      bot.sendMessage(
        chatId,
        "👋 Welcome to The Washing Machine Employee Bot!\n\nTo link your account:\n1. Log in to the Employee Portal.\n2. Go to your Profile.\n3. Click 'Connect Telegram'.\n4. Send the code provided there.",
        {
          reply_markup: {
            keyboard: [[{ text: "📅 My Jobs" }]],
            resize_keyboard: true,
            persistent: true,
          },
        },
      );
      return;
    }

    // Check for code pattern (8 hex chars) or /start <code_pattern>
    const codeMatch = text.match(/^(?:\/start\s+)?([a-fA-F0-9]{8})$/);

    if (!codeMatch) {
      return;
    }

    const code = codeMatch[1];

    try {
      // Verify Code
      const employeeId = await redis.get(`telegram_link:${code}`);

      if (!employeeId) {
        bot.sendMessage(
          chatId,
          "❌ Invalid or expired linking code. Please generate a new one from your portal.",
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
        {
          reply_markup: {
            keyboard: [[{ text: "📅 My Jobs" }]],
            resize_keyboard: true,
          },
        },
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

  // Handle Callback Queries (Inline Buttons)
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    try {
      if (data === "job_list") {
        await handleJobsCommand(chatId, messageId);
      } else if (data.startsWith("job:")) {
        const bookingId = data.split(":")[1];
        await handleJobDetails(chatId, messageId, bookingId);
      } else if (data.startsWith("start:")) {
        const bookingId = data.split(":")[1];
        await handleStartJob(chatId, messageId, bookingId);
      } else if (data.startsWith("complete:")) {
        const bookingId = data.split(":")[1];
        await handleCompleteJob(chatId, messageId, bookingId);
      }
      // Always answer callback to stop loading animation
      bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error("Callback Error:", error);
      bot.answerCallbackQuery(query.id, {
        text: "❌ Error processing request",
        show_alert: true,
      });
    }
  });

  bot.on("polling_error", (err) => console.log(err));
};

const handleJobsCommand = async (chatId, messageIdToEdit = null) => {
  try {
    const empRes = await pool.query(
      "SELECT empid FROM employee WHERE telegram_chat_id = $1",
      [chatId],
    );
    if (empRes.rowCount === 0) {
      sendMessage(chatId, "❌ You are not linked to an employee account.");
      return;
    }
    const empId = empRes.rows[0].empid;

    const bookings = await getAllBookingsService(empId, "employee", "employee");
    // Filter for active/upcoming
    const activeJobs = bookings.filter((b) =>
      ["pending", "inProgress"].includes(b.bookingstatus),
    );

    if (activeJobs.length === 0) {
      const txt = "🎉 You have no pending jobs assigned.";
      if (messageIdToEdit) {
        bot.editMessageText(txt, {
          chat_id: chatId,
          message_id: messageIdToEdit,
        });
      } else {
        sendMessage(chatId, txt);
      }
      return;
    }

    const inline_keyboard = activeJobs.map((b) => {
      const date = new Date(b.bookingdate).toISOString().split("T")[0];
      const time = b.bookingstarttime.slice(0, 5);
      return [
        {
          text: `📅 ${date} ${time} - ${b.vehbrand} ${b.vehmodel}`,
          callback_data: `job:${b.bookingid}`,
        },
      ];
    });

    const text = "📋 *Your Assigned Jobs*\nSelect a job to view details:";
    const options = {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard },
    };

    if (messageIdToEdit) {
      bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageIdToEdit,
        ...options,
      });
    } else {
      bot.sendMessage(chatId, text, options);
    }
  } catch (error) {
    console.error("Jobs Command Error:", error);
    sendMessage(chatId, "❌ failed to fetch jobs.");
  }
};

const handleJobDetails = async (chatId, messageId, bookingId) => {
  try {
    const empRes = await pool.query(
      "SELECT empid FROM employee WHERE telegram_chat_id = $1",
      [chatId],
    );
    const empId = empRes.rows[0].empid;

    const booking = await getBookingService(
      bookingId,
      empId,
      "employee",
      "employee",
    );

    // Format Details
    const dateStr = new Date(booking.bookingdate).toISOString().split("T")[0];
    const time = booking.bookingstarttime;
    const location = booking.bookinglocationlatitude
      ? `[Google Maps](https://www.google.com/maps?q=${booking.bookinglocationlatitude},${booking.bookinglocationlongitude})`
      : "Branch";

    const services = booking.services
      ? booking.services.map((s) => s.serviceName).join(", ")
      : "N/A";

    const msg = [
      `*JOB DETAILS*`,
      ``,
      `*Customer:* ${booking.cusname}`,
      `*Vehicle:* ${booking.vehbrand} ${booking.vehmodel} (${booking.vehplate})`,
      `*Service:* ${services}`,
      `*Date:* ${dateStr}`,
      `*Time:* ${time}`,
      `*Location:* ${location}`,
      `*Contact:* ${booking.cusphone}`,
      ``,
      `*Status:* ${booking.bookingstatus.toUpperCase()}`,
    ].join("\n");

    const inline_keyboard = [];

    // Check if job is TODAY
    const today = new Date().toISOString().split("T")[0];
    const isToday = dateStr === today;

    if (isToday) {
      if (booking.bookingstatus === "pending") {
        inline_keyboard.push([
          { text: "▶️ Start Service", callback_data: `start:${bookingId}` },
        ]);
      } else if (booking.bookingstatus === "inProgress") {
        inline_keyboard.push([
          {
            text: "✅ Complete Service",
            callback_data: `complete:${bookingId}`,
          },
        ]);
      }
    }

    inline_keyboard.push([
      { text: "🔙 Back to Jobs", callback_data: "job_list" },
    ]);

    bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard },
    });
  } catch (error) {
    console.error("Job Details Error:", error);
  }
};

const handleStartJob = async (chatId, messageId, bookingId) => {
  try {
    const empRes = await pool.query(
      "SELECT empid FROM employee WHERE telegram_chat_id = $1",
      [chatId],
    );
    const empId = empRes.rows[0].empid;

    await updateBookingService(
      bookingId,
      { status: "inProgress" },
      empId,
      "employee",
      "employee",
    );

    // Refresh Details View
    await handleJobDetails(chatId, messageId, bookingId);
    sendMessage(chatId, "✅ Service Started!");
  } catch (error) {
    console.error("Start Job Error:", error);
    sendMessage(chatId, "❌ Failed to start service: " + error.message);
  }
};

const handleCompleteJob = async (chatId, messageId, bookingId) => {
  try {
    const empRes = await pool.query(
      "SELECT empid FROM employee WHERE telegram_chat_id = $1",
      [chatId],
    );
    const empId = empRes.rows[0].empid;

    await updateBookingService(
      bookingId,
      { status: "completed" },
      empId,
      "employee",
      "employee",
    );

    // Refresh Details View (it might disappear from list if filter logic excludes completed, but details view handles generic GET)
    await handleJobDetails(chatId, messageId, bookingId);
    sendMessage(chatId, "🎉 Service Completed!");
  } catch (error) {
    console.error("Complete Job Error:", error);
    sendMessage(chatId, "❌ Failed to complete service: " + error.message);
  }
};

export const generateLinkingCode = async (employeeId) => {
  const code = crypto.randomBytes(4).toString("hex"); // 8 chars
  // Store in Redis with 5 min expiration
  await redis.set(`telegram_link:${code}`, employeeId, "EX", 300);
  return code;
};

export const getBot = () => bot;

export const sendMessage = async (chatId, text, options = {}) => {
  if (!bot) return;
  try {
    await bot.sendMessage(chatId, text, { parse_mode: "Markdown", ...options });
  } catch (error) {
    console.error("Error sending Telegram message:", error.message);
  }
};
