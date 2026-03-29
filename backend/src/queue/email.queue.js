import logger from "../configs/logger.js";
import { Queue, Worker } from "bullmq";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from "../configs/env.js";
import {
  sendEmail,
  sendOtpEmail,
  sendWelcomeEmail,
  sendServiceCompleteEmail,
} from "../services/email.service.js";

const connection = {
  host: REDIS_HOST || "localhost",
  port: REDIS_PORT || 6379,
  password: REDIS_PASSWORD,
};

export const emailQueue = new Queue("email-queue", { connection });

const worker = new Worker(
  "email-queue",
  async (job) => {
    logger.info(`Processing email job ${job.id}: ${job.name}`);
    const { type, to, subject, html, data } = job.data;

    try {
      if (type === "otp") {
        await sendOtpEmail(to, data.otp);
      } else if (type === "welcome") {
        await sendWelcomeEmail(to, data.password, data.loginUrl);
      } else if (type === "service_complete") {
        await sendServiceCompleteEmail(to, data);
      } else {
        await sendEmail({ to, subject, html });
      }
    } catch (error) {
      logger.error(`Failed to process email job ${job.id}:`, error);
      throw error;
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  logger.info(`Email job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  logger.error(`Email job ${job.id} failed: ${err.message}`);
});

export const addEmailJob = async (payload) => {
  await emailQueue.add("send-email", payload);
};
