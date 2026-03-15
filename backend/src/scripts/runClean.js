import logger from '../configs/logger.js';
import pool from "../configs/database.js";
import { cleanAllData } from "./dataClean.script.js";

async function main() {
  logger.info("Running db clean via script...");
  try {
    await cleanAllData(pool);
    logger.info("Done. All tables truncated and sequences reset.");
    process.exit(0);
  } catch (err) {
    logger.error("Clean failed:", err);
    process.exit(1);
  }
}

main();
