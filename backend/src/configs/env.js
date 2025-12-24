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
