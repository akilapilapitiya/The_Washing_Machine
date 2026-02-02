const createEmployeeDependentTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS employee_dependent (
      depid SERIAL PRIMARY KEY,
      empid INT NOT NULL,
      name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
      relationship VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(relationship)) > 0),
      contact_number VARCHAR(10) NOT NULL CHECK (contact_number ~ '^[0-9]{10}$'),
      is_emergency_contact BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_dependent_employee
        FOREIGN KEY (empid)
        REFERENCES employee(empid)
        ON DELETE CASCADE
    );

    -- Seed owner dependent if employee exists
    DO $$
    DECLARE
      owner_id INT;
    BEGIN
      SELECT empid INTO owner_id FROM employee WHERE email = 'owner@washingmachine.com';
      
      IF owner_id IS NOT NULL THEN
        INSERT INTO employee_dependent (empid, name, relationship, contact_number, is_emergency_contact)
        VALUES (owner_id, 'Akila Pilapitiya', 'Brother', '0774532348', TRUE)
        ON CONFLICT DO NOTHING;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_dependent_employee ON employee_dependent(empid);
  `;

  await pool.query(queryText);
};

export default createEmployeeDependentTable;
