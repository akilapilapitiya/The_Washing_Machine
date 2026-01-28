const createNotificationTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS notification (
      id SERIAL PRIMARY KEY,
      recipient_id INT NOT NULL,
      recipient_role VARCHAR(20) NOT NULL, -- 'customer' or 'employee' ('owner' etc)
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success'
      is_read BOOLEAN DEFAULT FALSE,
      booking_id INT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_notification_recipient ON notification(recipient_id, recipient_role);
    CREATE INDEX IF NOT EXISTS idx_notification_unread ON notification(recipient_id) WHERE is_read = FALSE;
  `;

  await pool.query(queryText);
};

export default createNotificationTable;
