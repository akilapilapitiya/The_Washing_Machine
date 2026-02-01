const createCustomerTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS customer (
      cusid SERIAL PRIMARY KEY,
      title VARCHAR(10) CHECK (title IN ('Mr.', 'Mrs.', 'Ms.', 'Ven.', 'Rev.')),
      first_name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(first_name)) > 0),
      last_name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(last_name)) > 0),
      cusemail VARCHAR(100) UNIQUE NOT NULL
        CHECK (cusemail ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
      custel VARCHAR(10) NOT NULL
        CHECK (custel ~ '^[0-9]{10}$'),
      nic VARCHAR(20) UNIQUE,
      dob DATE,
      latitude NUMERIC(10, 8),
      longitude NUMERIC(11, 8),
      profile_picture_url TEXT,
      password_hash VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(cusemail);
  `;

  await pool.query(queryText);
};

export default createCustomerTable;
