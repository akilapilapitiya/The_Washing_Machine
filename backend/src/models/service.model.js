const createServiceTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS service (
      serviceid SERIAL PRIMARY KEY,
      servicename VARCHAR(100) NOT NULL,
      servicetime TIME NOT NULL,
      serviceprice DECIMAL(10,2) NOT NULL CHECK (serviceprice >= 0),
      servicedetails VARCHAR(255),
      short_description TEXT,
      long_description TEXT,
      image_url TEXT,
      gallery_urls JSONB DEFAULT '[]',
      benefits JSONB DEFAULT '[]',
      category VARCHAR(50),
      is_featured BOOLEAN DEFAULT FALSE,
      is_variable_price BOOLEAN DEFAULT FALSE,
      has_offer BOOLEAN DEFAULT FALSE,
      offer_price DECIMAL(10,2),
      offer_description TEXT,
      offer_start_date TIMESTAMP,
      offer_end_date TIMESTAMP,
      servicetype VARCHAR(20) DEFAULT 'package',
      has_offer BOOLEAN DEFAULT FALSE,
      offer_price DECIMAL(10,2),
      offer_description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Ensure all new columns exist for existing tables
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='short_description') THEN
        ALTER TABLE service ADD COLUMN short_description TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='long_description') THEN
        ALTER TABLE service ADD COLUMN long_description TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='image_url') THEN
        ALTER TABLE service ADD COLUMN image_url TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='gallery_urls') THEN
        ALTER TABLE service ADD COLUMN gallery_urls JSONB DEFAULT '[]';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='benefits') THEN
        ALTER TABLE service ADD COLUMN benefits JSONB DEFAULT '[]';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='category') THEN
        ALTER TABLE service ADD COLUMN category VARCHAR(50);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='is_featured') THEN
        ALTER TABLE service ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='is_variable_price') THEN
        ALTER TABLE service ADD COLUMN is_variable_price BOOLEAN DEFAULT FALSE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='has_offer') THEN
        ALTER TABLE service ADD COLUMN has_offer BOOLEAN DEFAULT FALSE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='offer_price') THEN
        ALTER TABLE service ADD COLUMN offer_price DECIMAL(10,2);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='offer_description') THEN
        ALTER TABLE service ADD COLUMN offer_description TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='offer_start_date') THEN
        ALTER TABLE service ADD COLUMN offer_start_date TIMESTAMP;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service' AND column_name='offer_end_date') THEN
        ALTER TABLE service ADD COLUMN offer_end_date TIMESTAMP;
      END IF;
    END $$;
  `;

  await pool.query(queryText);
};

export default createServiceTable;
