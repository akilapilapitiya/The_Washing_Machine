import pino from "pino";
import { NODE_ENV } from "./env.js";

// Configure Pino logic based on environment
const logger = pino({
  level: NODE_ENV === "production" ? "info" : "debug",
  transport:
    NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  base: {
    env: NODE_ENV,
  },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});

export default logger;
