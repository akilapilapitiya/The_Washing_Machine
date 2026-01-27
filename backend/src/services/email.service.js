import nodemailer from "nodemailer";
import { otpTemplate } from "../templates/email.templates.js";
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

  console.log("Message sent: %s", info.messageId);

  // Preview only available when sending through an Ethereal account
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("Preview URL: %s", previewUrl);
  }

  return info;
};

export const sendOtpEmail = async (to, otp) => {
  const html = otpTemplate(otp);
  const transport = await createTransporter();

  // Resolve logo path relative to current working directory (backend root)
  // Assuming code is running from backend/app.js or similar root
  const logoPath = "./src/templates/logo.svg";

  try {
    await transport.sendMail({
      from: '"The Washing Machine" <no-reply@washingmachine.com>',
      to,
      subject: "Reset Your Password - The Washing Machine",
      html,
      attachments: [
        {
          filename: "logo.svg",
          path: logoPath,
          cid: "logo@washingmachine", // same cid value as in the html img src
        },
      ],
    });

    console.log(`✅ OTP Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${to}`);
    // console.error(error); // Uncomment for debugging
  }
};
