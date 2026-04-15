const createSysSettingsTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS sys_settings (
      key VARCHAR(50) PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Insert default travel pricing rules if not exists
    INSERT INTO sys_settings (key, value, description) 
    VALUES (
      'travel_pricing_rules',
      '{"base_km": 5, "base_fee": 500, "additional_rate": 100}',
      'Configuration for travel cost calculation: { base_km, base_fee, additional_rate }'
    )
    ON CONFLICT (key) DO NOTHING;

    INSERT INTO sys_settings (key, value, description) 
    VALUES (
      'default_service_frequency_days',
      '90',
      'Default service frequency in days for new customers'
    )
    ON CONFLICT (key) DO NOTHING;

    INSERT INTO sys_settings (key, value, description) 
    VALUES (
      'service_reminder_prior_days',
      '7',
      'Number of days prior to next service date to send reminder'
    )
    ON CONFLICT (key) DO NOTHING;
  `;

  await pool.query(queryText);
};

export default createSysSettingsTable;
