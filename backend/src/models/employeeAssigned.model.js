const createEmployeeAssignedTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS employeeassigned (
      bookingid INT NOT NULL,
      empid INT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (bookingid, empid),
      CONSTRAINT fk_empassigned_booking
        FOREIGN KEY (bookingid)
        REFERENCES booking(bookingid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_empassigned_employee
        FOREIGN KEY (empid)
        REFERENCES employee(empid)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_empassigned_employee ON employeeassigned(empid);
  `;

  await pool.query(queryText);
  console.log("EmployeeAssigned table created");
};

export default createEmployeeAssignedTable;
