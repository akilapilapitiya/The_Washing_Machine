import pool from "../configs/database.js";
import { cleanAllData } from "./dataClean.script.js";

async function main() {
  console.log("Running db clean via script...");
  try {
    await cleanAllData(pool);
    console.log("Done. All tables truncated and sequences reset.");
    process.exit(0);
  } catch (err) {
    console.error("Clean failed:", err);
    process.exit(1);
  }
}

main();
