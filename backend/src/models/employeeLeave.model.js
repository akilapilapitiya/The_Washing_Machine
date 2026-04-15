const createEmployeeLeaveTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS employeeleave (
      leaveid SERIAL PRIMARY KEY,
      leavestartdate DATE NOT NULL,
      leaveenddate DATE NOT NULL,
      leavereason VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(leavereason)) > 0),
      empid INT NOT NULL,
      leavestarttime TIME,
      leaveendtime TIME,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_leave_employee
        FOREIGN KEY (empid)
        REFERENCES employee(empid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT chk_leave_dates
        CHECK (leaveenddate >= leavestartdate)
    );
    
    CREATE INDEX IF NOT EXISTS idx_leave_employee ON employeeleave(empid);
    CREATE INDEX IF NOT EXISTS idx_leave_dates ON employeeleave(leavestartdate, leaveenddate);

    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employeeleave' AND column_name='leavestarttime') THEN
        ALTER TABLE employeeleave ADD COLUMN leavestarttime TIME;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employeeleave' AND column_name='leaveendtime') THEN
        ALTER TABLE employeeleave ADD COLUMN leaveendtime TIME;
      END IF;
    END $$;
  `;

  await pool.query(queryText);
};

export default createEmployeeLeaveTable;
