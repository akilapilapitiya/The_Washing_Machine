import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config({ path: ".env.development.local" });

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = "1585635103";

if (!token) {
    console.error("No token found");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: false });

console.log("Sending test message...");
bot.sendMessage(chatId, "🚀 *Test Message* from Washing Machine Debug Script")
    .then(() => {
        console.log("✅ Test message sent successfully!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Failed to send test message:", err.message);
        process.exit(1);
    });
