const createFeedbackTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS feedback (
      feedbackid SERIAL PRIMARY KEY,
      feedbackdescription VARCHAR(500) NOT NULL CHECK (LENGTH(TRIM(feedbackdescription)) > 0),
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      bookingid INT NOT NULL UNIQUE,
      cusid INT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_feedback_booking
        FOREIGN KEY (bookingid)
        REFERENCES booking(bookingid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_feedback_customer
        FOREIGN KEY (cusid)
        REFERENCES customer(cusid)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_feedback_booking ON feedback(bookingid);
    CREATE INDEX IF NOT EXISTS idx_feedback_customer ON feedback(cusid);
    CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
  `;

  await pool.query(queryText);
  console.log("Feedback table created");
};

export default createFeedbackTable;
