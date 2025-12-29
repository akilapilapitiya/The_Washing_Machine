import { config } from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "development"}.local`;
config({ path: envFile });

export const {
  PORT,
  NODE_ENV,
  DB_USER,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  DB_PASSWORD,
  JWT_SECRET,
  JWT_EXPIRES_IN,
} = process.env;

export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);
export const COOKIE_AGE = Number(process.env.COOKIE_AGE);
export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000;
export const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
export const RATE_LIMIT_AUTH_MAX = Number(process.env.RATE_LIMIT_AUTH_MAX) || 5;
