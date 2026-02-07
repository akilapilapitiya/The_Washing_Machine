const createServicesBookedTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS servicesbooked (
      bookingid INT NOT NULL,
      serviceid INT NOT NULL,
      service_name VARCHAR(255), -- Snapshot at booking time
      service_price_at_booking DECIMAL(10, 2), -- Snapshot at booking time
      created_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (bookingid, serviceid),
      CONSTRAINT fk_servicesbooked_booking
        FOREIGN KEY (bookingid)
        REFERENCES booking(bookingid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_servicesbooked_service
        FOREIGN KEY (serviceid)
        REFERENCES service(serviceid)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );

    -- Migration: Add columns if they don't exist
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicesbooked' AND column_name='service_name') THEN
            ALTER TABLE servicesbooked ADD COLUMN service_name VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='servicesbooked' AND column_name='service_price_at_booking') THEN
            ALTER TABLE servicesbooked ADD COLUMN service_price_at_booking DECIMAL(10, 2);
        END IF;
    END
    $$;
    
    CREATE INDEX IF NOT EXISTS idx_servicesbooked_service ON servicesbooked(serviceid);
  `;

  await pool.query(queryText);
};

export default createServicesBookedTable;
