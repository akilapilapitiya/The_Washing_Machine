const createEmployeePreferenceTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS employeepreference (
      bookingid INT NOT NULL,
      empid INT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (bookingid, empid),
      CONSTRAINT fk_emppreference_booking
        FOREIGN KEY (bookingid)
        REFERENCES booking(bookingid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_emppreference_employee
        FOREIGN KEY (empid)
        REFERENCES employee(empid)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_emppreference_employee ON employeepreference(empid);
  `;

  await pool.query(queryText);
};

export default createEmployeePreferenceTable;
