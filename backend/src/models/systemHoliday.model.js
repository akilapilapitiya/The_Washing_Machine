const createSystemHolidayTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS system_holidays (
      holidayid SERIAL PRIMARY KEY,
      holidayname VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(holidayname)) > 0),
      holidaydate DATE NOT NULL,
      starttime TIME,
      endtime TIME,
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

    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_holidays' AND column_name='starttime') THEN
        ALTER TABLE system_holidays ADD COLUMN starttime TIME;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_holidays' AND column_name='endtime') THEN
        ALTER TABLE system_holidays ADD COLUMN endtime TIME;
      END IF;
    END $$;

    -- Drop the unique constraint on holidaydate if it exists
    ALTER TABLE system_holidays DROP CONSTRAINT IF EXISTS system_holidays_holidaydate_key;
  `;

  await pool.query(queryText);
};

export default createSystemHolidayTable;
