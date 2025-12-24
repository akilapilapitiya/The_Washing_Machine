import pool from "../configs/database.js";
import { cleanAllData } from "./dataClean.debug.js";

async function main() {
  console.log("[DEBUG] Running db clean via script...");
  try {
    await cleanAllData(pool);
    console.log("[DEBUG] Done. All tables truncated and sequences reset.");
    process.exit(0);
  } catch (err) {
    console.error("[DEBUG] Clean failed:", err);
    process.exit(1);
  }
}

main();
