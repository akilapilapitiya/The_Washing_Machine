const createEmployeeTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS employee (
      empid SERIAL PRIMARY KEY,
      empname VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(empname)) > 0),
      email VARCHAR(100) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
      emptel VARCHAR(10) NOT NULL CHECK (emptel ~ '^[0-9]{10}$'),
      emptype VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(emptype)) > 0),
      empnic VARCHAR(12) UNIQUE NOT NULL CHECK (empnic ~ '^[0-9]{9}[Vv]$|^[0-9]{12}$'),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_employee_email ON employee(email);
    CREATE INDEX IF NOT EXISTS idx_employee_nic ON employee(empnic);
    CREATE INDEX IF NOT EXISTS idx_employee_type ON employee(emptype);
  `;

  await pool.query(queryText);
  console.log("Employee table created");
};

export default createEmployeeTable;
