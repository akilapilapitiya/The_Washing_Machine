import logger from './logger.js';
import pkg from "pg";
import { DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT } from "./env.js";

const { Pool } = pkg;

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
});

pool.on("connect", () => {
  logger.info("Connection Pool Established with Database");
});

pool.on("error", (err) => {
  logger.error("Unexpected error on idle database client", err);
});

export default pool;
