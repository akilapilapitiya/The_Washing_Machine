const createSystemHolidayTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS system_holidays (
      holidayid SERIAL PRIMARY KEY,
      holidayname VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(holidayname)) > 0),
      holidaydate DATE NOT NULL UNIQUE,
      holidaytype VARCHAR(20) DEFAULT 'public',
      description TEXT,
      is_recurring BOOLEAN DEFAULT FALSE,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_holiday_creator
        FOREIGN KEY (created_by)
        REFERENCES employee(empid)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
      CONSTRAINT chk_holiday_type
        CHECK (holidaytype IN ('public', 'company', 'custom'))
    );
    
    CREATE INDEX IF NOT EXISTS idx_holiday_date ON system_holidays(holidaydate);
    CREATE INDEX IF NOT EXISTS idx_holiday_recurring ON system_holidays(is_recurring);
  `;

  await pool.query(queryText);
};

export default createSystemHolidayTable;
