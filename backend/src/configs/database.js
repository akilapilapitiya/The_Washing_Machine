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
  console.log("Connection Pool Established with Database");
});

export default pool;
