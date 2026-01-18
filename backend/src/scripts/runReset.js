import pool from "../configs/database.js";
import { resetDatabase } from "./dbReset.script.js";
import { seedOwnerAccount } from "./addOwner.js";

async function main() {
  const args = process.argv.slice(2);
  const shouldSeedOwner = args.includes("--seed-owner");

  console.log("Running database reset...");
  try {
    // Reset database schema
    await resetDatabase(pool);

    // Optionally seed owner account
    if (shouldSeedOwner) {
      console.log("\n[SEED] Seeding owner account...");
      await seedOwnerAccount(pool);
      console.log("[SEED] Owner account seeded successfully.");
    }

    console.log("\n✓ Database reset complete!");
    process.exit(0);
  } catch (err) {
    console.error("Reset failed:", err);
    process.exit(1);
  }
}

main();
