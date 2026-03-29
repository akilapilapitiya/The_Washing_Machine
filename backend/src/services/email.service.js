import logger from "../configs/logger.js";
import nodemailer from "nodemailer";
import { otpTemplate, welcomeTemplate } from "../templates/email.templates.js";
import { NODE_ENV } from "../configs/env.js";

// Create transporter
// For dev/test, we try to use Ethereal if no real credentials provided
const createTransporter = async () => {
  // Always create a new transporter to avoid caching stale configs
  // Added debug options to match the working test script
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const transport = await createTransporter();

  const info = await transport.sendMail({
    from: '"The Washing Machine" <no-reply@washingmachine.com>',
    to,
    subject,
    html,
  });

  logger.info("Message sent: %s", info.messageId);

  // Preview only available when sending through an Ethereal account
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    logger.info("Preview URL: %s", previewUrl);
  }

  return info;
};

export const sendOtpEmail = async (to, otp) => {
  const html = otpTemplate(otp);
  const transport = await createTransporter();

  // Resolve logo path relative to current working directory
  const logoPath = "./src/templates/logo.jpg";

  try {
    await transport.sendMail({
      from: '"The Washing Machine" <no-reply@washingmachine.com>',
      to,
      subject: "Reset Your Password - The Washing Machine",
      html,
      attachments: [
        {
          filename: "logo.jpg",
          path: logoPath,
          cid: "logo@washingmachine", // same cid value as in the html img src
        },
      ],
    });

    logger.info(`✅ OTP Email sent to ${to}`);
  } catch (error) {
    logger.error(`❌ Failed to send OTP email to ${to}`);
    // logger.error(error); // Uncomment for debugging
  }
};

export const sendWelcomeEmail = async (to, password, loginUrl) => {
  const html = welcomeTemplate(password, loginUrl);
  const transport = await createTransporter();

  // Resolve logo path relative to current working directory
  const logoPath = "./src/templates/logo.jpg";

  try {
    await transport.sendMail({
      from: '"The Washing Machine" <no-reply@washingmachine.com>',
      to,
      subject: "Welcome to The Washing Machine - Action Required",
      html,
      attachments: [
        {
          filename: "logo.jpg",
          path: logoPath,
          cid: "logo@washingmachine",
        },
      ],
    });

    logger.info(`✅ Welcome Email sent to ${to}`);
  } catch (error) {
    logger.error(`❌ Failed to send Welcome email to ${to}`);
  }
};
