import pool from "../../src/configs/database.js";

const seedSystemSettings = async (pool) => {
  const settings = [
    {
      key: "travel_pricing_rules",
      value: JSON.stringify({
        base_km: 5,
        base_fee: 500,
        additional_rate: 100,
        buffer_minutes: 30,
      }),
    },
    {
      key: "hq_location",
      value: JSON.stringify({
        latitude: 6.8413,
        longitude: 79.9729,
        address: "Pannipitiya, Sri Lanka",
      }),
    },
    {
      key: "service_radius_km",
      value: JSON.stringify(25),
    },
  ];

  console.log("⚙️  Seeding system settings...");

  for (const setting of settings) {
    await pool.query(
      `INSERT INTO sys_settings (key, value) 
       VALUES ($1, $2) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [setting.key, setting.value],
    );
  }

  console.log("✓ System settings seeded successfully");
};

export default seedSystemSettings;
