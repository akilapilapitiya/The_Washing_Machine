import pool from "../configs/database.js";

const updateSchemaPricing = async () => {
  const client = await pool.connect();
  try {
    console.log("Starting pricing schema update...");
    await client.query("BEGIN");

    // 1. Alter sys_settings.value to TEXT to allow long JSON strings
    await client.query(`
      ALTER TABLE sys_settings 
      ALTER COLUMN value TYPE TEXT;
    `);
    console.log("Updated sys_settings.value to TEXT type.");

    // 2. Insert default travel pricing rules
    // Rule: First 5km = 500 LKR (fixed), Additional km = 100 LKR/km
    const defaultRules = JSON.stringify({
      base_km: 5,
      base_fee: 500,
      additional_rate: 100,
    });

    await client.query(
      `
      INSERT INTO sys_settings (key, value, description) 
      VALUES ($1, $2, $3)
      ON CONFLICT (key) 
      DO UPDATE SET value = $2, description = $3;
    `,
      [
        "travel_pricing_rules",
        defaultRules,
        "Configuration for travel cost calculation: { base_km, base_fee, additional_rate }",
      ],
    );
    console.log("Inserted/Updated travel_pricing_rules.");

    await client.query("COMMIT");
    console.log("Pricing schema update completed successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Schema update failed:", err);
  } finally {
    client.release();
    process.exit();
  }
};

updateSchemaPricing();
