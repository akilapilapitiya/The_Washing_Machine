const createServicesBookedTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS servicesbooked (
      bookingid INT NOT NULL,
      serviceid INT NOT NULL,
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
    
    CREATE INDEX IF NOT EXISTS idx_servicesbooked_service ON servicesbooked(serviceid);
  `;

  await pool.query(queryText);
  console.log("ServicesBooked table created");
};

export default createServicesBookedTable;
