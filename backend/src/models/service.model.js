const createServiceTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS service (
      serviceid SERIAL PRIMARY KEY,
      servicename VARCHAR(80) NOT NULL,
      servicetime TIME NOT NULL,
      serviceprice DECIMAL(10,2) NOT NULL CHECK (serviceprice >= 0),
      servicedetails VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await pool.query(queryText);
  console.log("Service table created");
};

export default createServiceTable;
