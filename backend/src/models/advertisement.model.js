import logger from '../configs/logger.js';
const createAdvertisementTable = async (pool) => {
  const query = `
    CREATE TABLE IF NOT EXISTS advertisement (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      image_url TEXT,
      client_name VARCHAR(255),
      client_contact VARCHAR(50),
      expiry_date TIMESTAMPTZ,
      status VARCHAR(50) DEFAULT 'active',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    logger.info("✓ Advertisement table ensured");
  } catch (err) {
    logger.error("Error creating advertisement table:", err.message);
    throw err;
  }
};

export default createAdvertisementTable;
