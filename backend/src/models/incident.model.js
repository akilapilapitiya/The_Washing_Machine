const createIncidentTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS incident (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER,
      customer_id INTEGER,
      booking_id INTEGER,
      description TEXT NOT NULL,
      severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
      status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_incident_employee
        FOREIGN KEY (employee_id)
        REFERENCES employee(empid)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
      CONSTRAINT fk_incident_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(cusid)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
      CONSTRAINT fk_incident_booking
        FOREIGN KEY (booking_id)
        REFERENCES booking(bookingid)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_incident_employee ON incident(employee_id);
    CREATE INDEX IF NOT EXISTS idx_incident_customer ON incident(customer_id);
    CREATE INDEX IF NOT EXISTS idx_incident_booking ON incident(booking_id);
    CREATE INDEX IF NOT EXISTS idx_incident_status ON incident(status);
  `;

  await pool.query(queryText);
};

export default createIncidentTable;
