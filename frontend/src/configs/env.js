import { config } from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "development"}.local`;
config({ path: envFile });

export const { PORT } = process.env;
