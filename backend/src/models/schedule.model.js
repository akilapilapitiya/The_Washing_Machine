const createScheduleTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS schedule (
      scheduleid VARCHAR(7) PRIMARY KEY CHECK (scheduleid ~ '^[A-Z0-9-]{7}$'),
      schedulestartdate DATE NOT NULL,
      scheduleenddate DATE NOT NULL,
      schedulestarttime TIME NOT NULL,
      scheduleendtime TIME NOT NULL,
      bookingid INT,
      leaveid INT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_schedule_booking
        FOREIGN KEY (bookingid)
        REFERENCES booking(bookingid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_schedule_leave
        FOREIGN KEY (leaveid)
        REFERENCES employeeleave(leaveid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT chk_booking_or_leave
        CHECK (
          (bookingid IS NOT NULL AND leaveid IS NULL)
          OR
          (bookingid IS NULL AND leaveid IS NOT NULL)
        ),
      CONSTRAINT chk_schedule_dates
        CHECK (scheduleenddate >= schedulestartdate),
      CONSTRAINT chk_schedule_time
        CHECK (scheduleendtime > schedulestarttime)
    );
    
    CREATE INDEX IF NOT EXISTS idx_schedule_booking ON schedule(bookingid);
    CREATE INDEX IF NOT EXISTS idx_schedule_leave ON schedule(leaveid);
    CREATE INDEX IF NOT EXISTS idx_schedule_dates ON schedule(schedulestartdate, scheduleenddate);
  `;

  await pool.query(queryText);
};

export default createScheduleTable;

// Checks for API data integrity
// Either the booking or the leave foriegn key must be present, but not both
