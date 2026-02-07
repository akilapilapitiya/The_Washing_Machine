import pool from "../../src/configs/database.js";
import seedRoles from "./01_roles.seed.js";
import seedSystemSettings from "./02_system_settings.seed.js";
import seedOwnerAccount from "./03_owner_account.seed.js";

async function runSeeds() {
  const client = await pool.connect();

  try {
    console.log("🌱 Starting database seeding...\n");

    await client.query("BEGIN");

    await seedRoles(pool);
    await seedSystemSettings(pool);
    await seedOwnerAccount(pool);

    await client.query("COMMIT");

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📝 Default Owner Credentials:");
    console.log("   Email: owner@washingmachine.lk");
    console.log("   Password: Owner@123");
    console.log("\n⚠️  Please change the password after first login!\n");

    process.exit(0);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("\n❌ Seeding failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  } finally {
    client.release();
  }
}

runSeeds();
