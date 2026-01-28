const createPasswordResetTokenTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS password_reset_token (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(email)) > 0),
      user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('customer', 'employee')),
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      is_used BOOLEAN DEFAULT FALSE,
      failed_attempts INTEGER DEFAULT 0 CHECK (failed_attempts >= 0),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_token(email);
    CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_token(expires_at);
    CREATE INDEX IF NOT EXISTS idx_password_reset_used ON password_reset_token(is_used);
  `;

  await pool.query(queryText);
};

export default createPasswordResetTokenTable;
