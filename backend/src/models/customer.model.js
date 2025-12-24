const createCustomerTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS customer (
  cusid SERIAL PRIMARY KEY,
  cusname VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(cusname)) > 0),
  cusemail VARCHAR(100) UNIQUE NOT NULL
    CHECK (cusemail ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  custel VARCHAR(10) NOT NULL
    CHECK (custel ~ '^[0-9]{10}$'),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

    
    CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(cusemail);
  `;

  await pool.query(queryText);
  console.log("Customer table created");
};

export default createCustomerTable;
