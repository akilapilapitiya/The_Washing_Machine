const createBookingTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS booking (
      bookingid SERIAL PRIMARY KEY,
      bookingstatus VARCHAR(15) NOT NULL CHECK (bookingstatus IN ('pending', 'inProgress', 'completed', 'paid')),
      bookingdate DATE NOT NULL,
      bookingstarttime TIME NOT NULL,
      bookingendtime TIME NOT NULL,
      bookinglocationlatitude DECIMAL(9,6) NOT NULL CHECK (bookinglocationlatitude BETWEEN -90 AND 90),
      bookinglocationlongitude DECIMAL(9,6) NOT NULL CHECK (bookinglocationlongitude BETWEEN -180 AND 180),
      vehid INT NOT NULL,
      totalprice DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (totalprice >= 0),
      travel_distance DECIMAL(10,2) DEFAULT 0,
      travel_duration INT DEFAULT 0,
      travel_cost DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_booking_vehicle
        FOREIGN KEY (vehid)
        REFERENCES vehicle(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT chk_booking_time
        CHECK (bookingendtime > bookingstarttime)
    );

    -- Ensure totalprice column exists
    ALTER TABLE booking ADD COLUMN IF NOT EXISTS totalprice DECIMAL(10,2) NOT NULL DEFAULT 0;

    -- Drop restrictive date check constraint if it exists to allow payment recording for past bookings
    ALTER TABLE booking DROP CONSTRAINT IF EXISTS booking_bookingdate_check;
    
    CREATE INDEX IF NOT EXISTS idx_booking_vehicle ON booking(vehid);
    CREATE INDEX IF NOT EXISTS idx_booking_date ON booking(bookingdate);
    CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(bookingstatus);
  `;

  await pool.query(queryText);
};

export default createBookingTable;
