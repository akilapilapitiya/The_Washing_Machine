const createBookingTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS booking (
      bookingid SERIAL PRIMARY KEY,
      bookingstatus VARCHAR(15) NOT NULL CHECK (bookingstatus IN ('pending', 'inProgress', 'completed', 'paid')),
      bookingdate DATE NOT NULL CHECK (bookingdate >= CURRENT_DATE),
      bookingstarttime TIME NOT NULL,
      bookingendtime TIME NOT NULL,
      bookinglocationlatitude DECIMAL(9,6) NOT NULL CHECK (bookinglocationlatitude BETWEEN -90 AND 90),
      bookinglocationlongitude DECIMAL(9,6) NOT NULL CHECK (bookinglocationlongitude BETWEEN -180 AND 180),
      vehid VARCHAR(7) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_booking_vehicle
        FOREIGN KEY (vehid)
        REFERENCES vehicle(vehid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT chk_booking_time
        CHECK (bookingendtime > bookingstarttime)
    );
    
    CREATE INDEX IF NOT EXISTS idx_booking_vehicle ON booking(vehid);
    CREATE INDEX IF NOT EXISTS idx_booking_date ON booking(bookingdate);
    CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(bookingstatus);
  `;

  await pool.query(queryText);
  console.log("Booking table created");
};

export default createBookingTable;
