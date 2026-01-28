import { config } from "dotenv";
import nodemailer from "nodemailer";
import path from "path";

// Load env vars
const envFile = `.env.${process.env.NODE_ENV || "development"}.local`;
config({ path: envFile });

async function testEmail() {
  console.log("------------------------------------------");
  console.log("📧 Starting Email Test");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`SMTP Port: ${process.env.SMTP_PORT}`);
  console.log(`SMTP User: ${process.env.SMTP_USER}`);
  console.log("------------------------------------------");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Debug options to see detailed SMTP logs
    logger: true,
    debug: true,
  });

  try {
    console.log("Attempting to verify connection...");
    await transporter.verify();
    console.log("✅ SMTP Connection Validated");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: '"Test Script" <no-reply@washingmachine.com>',
      to: "sanjanimapa@gmail.com", // The email user tried
      subject: "Test Email from Debug Script",
      text: "If you see this, the SMTP configuration is working correctly.",
      html: "<b>If you see this, the SMTP configuration is working correctly.</b>",
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email Test Failed:");
    console.error(error);
  }
}

testEmail();
