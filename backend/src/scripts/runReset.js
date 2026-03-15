import logger from '../configs/logger.js';
import pool from "../configs/database.js";
import { resetDatabase } from "./dbReset.script.js";
import { seedOwnerAccount } from "./addOwner.js";

async function main() {
  const args = process.argv.slice(2);
  const shouldSeedOwner = args.includes("--seed-owner");

  logger.info("Running database reset...");
  try {
    // Reset database schema
    await resetDatabase(pool);

    // Optionally seed owner account
    if (shouldSeedOwner) {
      logger.info("\n[SEED] Seeding owner account...");
      await seedOwnerAccount(pool);
      logger.info("[SEED] Owner account seeded successfully.");
    }

    logger.info("\n✓ Database reset complete!");
    process.exit(0);
  } catch (err) {
    logger.error("Reset failed:", err);
    process.exit(1);
  }
}

main();
