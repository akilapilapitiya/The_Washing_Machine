const createBookingExtrasTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS booking_extras (
      id SERIAL PRIMARY KEY,
      booking_id INT NOT NULL,
      item_name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2), -- Nullable, filled by Cashier
      added_by INT,
      priced_by INT, -- New: Track who set the price
      priced_at TIMESTAMP, -- New: When price was set
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_extras_booking
        FOREIGN KEY (booking_id)
        REFERENCES booking(bookingid)
        ON DELETE CASCADE,
      CONSTRAINT fk_extras_employee
        FOREIGN KEY (added_by)
        REFERENCES employee(empid)
        ON DELETE SET NULL,
     CONSTRAINT fk_extras_pricer
        FOREIGN KEY (priced_by)
        REFERENCES employee(empid)
        ON DELETE SET NULL
    );

    -- Ensure columns exist (Migration-like behavior)
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='booking_extras' AND column_name='priced_by') THEN
            ALTER TABLE booking_extras ADD COLUMN priced_by INT REFERENCES employee(empid) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='booking_extras' AND column_name='priced_at') THEN
            ALTER TABLE booking_extras ADD COLUMN priced_at TIMESTAMP;
        END IF;
    END
    $$;

    CREATE INDEX IF NOT EXISTS idx_extras_booking ON booking_extras(booking_id);
  `;

  await pool.query(queryText);
};

export default createBookingExtrasTable;
