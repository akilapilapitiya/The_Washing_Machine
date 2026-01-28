const createRoleTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS role (
      roleid SERIAL PRIMARY KEY,
      rolename VARCHAR(50) UNIQUE NOT NULL CHECK (LENGTH(TRIM(rolename)) > 0),
      role_description TEXT,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Seed roles if they don't exist
    INSERT INTO role (rolename, role_description, is_admin)
    VALUES 
      ('owner', 'System Owner with full administrative control over all features and staff.', TRUE),
      ('cashier', 'Staff responsible for managing customer records, payments, and feedback.', FALSE),
      ('employee', 'Technical operative focused on completing assigned service jobs.', FALSE)
    ON CONFLICT (rolename) DO UPDATE SET
      role_description = EXCLUDED.role_description,
      is_admin = EXCLUDED.is_admin,
      updated_at = NOW();
  `;

  await pool.query(queryText);
};

export default createRoleTable;
