const createBookingExtrasTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS booking_extras (
      id SERIAL PRIMARY KEY,
      booking_id INT NOT NULL,
      item_name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2), -- Nullable, filled by Cashier
      added_by INT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_extras_booking
        FOREIGN KEY (booking_id)
        REFERENCES booking(bookingid)
        ON DELETE CASCADE,
      CONSTRAINT fk_extras_employee
        FOREIGN KEY (added_by)
        REFERENCES employee(empid)
        ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_extras_booking ON booking_extras(booking_id);
  `;

  await pool.query(queryText);
};

export default createBookingExtrasTable;
