const createPaymentTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS payment (
      paymentid SERIAL PRIMARY KEY,
      paymentdate DATE NOT NULL DEFAULT CURRENT_DATE,
      paymenttype VARCHAR(10) NOT NULL CHECK (paymenttype IN ('cash', 'card', 'online')),
      paymentamount DECIMAL(10,2) NOT NULL CHECK (paymentamount > 0),
      bookingid INT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_payment_booking
        FOREIGN KEY (bookingid)
        REFERENCES booking(bookingid)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_payment_booking ON payment(bookingid);
    CREATE INDEX IF NOT EXISTS idx_payment_date ON payment(paymentdate);
  `;

  await pool.query(queryText);
  console.log("Payment table created");
};

export default createPaymentTable;
