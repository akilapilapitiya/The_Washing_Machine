const createVehicleTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS vehicle (
      id SERIAL PRIMARY KEY,
      vehplate VARCHAR(20) NOT NULL CHECK (LENGTH(TRIM(vehplate)) > 0),
      vehmileage INT NOT NULL DEFAULT 0 CHECK (vehmileage >= 0),
      vehbrand VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(vehbrand)) > 0),
      vehmodel VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(vehmodel)) > 0),
      fuel_type VARCHAR(20) CHECK (fuel_type IN ('Petrol', 'Diesel', 'Hybrid', 'Electric', 'Other')),
      vehcolor VARCHAR(30),
      next_service_mileage INT DEFAULT 0,
      next_service_date DATE,
      manufacture_year INT,
      transmission VARCHAR(20) CHECK (transmission IN ('Manual', 'Automatic')),
      engine_capacity INT,
      cusid INT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_vehicle_customer
        FOREIGN KEY (cusid)
        REFERENCES customer(cusid)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT uk_customer_vehicle_plate UNIQUE (cusid, vehplate)
    );
    
    -- Migration: Add columns to existing table if they don't exist
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicle' AND column_name='fuel_type') THEN
        ALTER TABLE vehicle ADD COLUMN fuel_type VARCHAR(20) CHECK (fuel_type IN ('Petrol', 'Diesel', 'Hybrid', 'Electric', 'Other'));
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicle' AND column_name='vehcolor') THEN
        ALTER TABLE vehicle ADD COLUMN vehcolor VARCHAR(30);
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicle' AND column_name='next_service_mileage') THEN
        ALTER TABLE vehicle ADD COLUMN next_service_mileage INT DEFAULT 0;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicle' AND column_name='next_service_date') THEN
        ALTER TABLE vehicle ADD COLUMN next_service_date DATE;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicle' AND column_name='manufacture_year') THEN
        ALTER TABLE vehicle ADD COLUMN manufacture_year INT;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicle' AND column_name='transmission') THEN
        ALTER TABLE vehicle ADD COLUMN transmission VARCHAR(20) CHECK (transmission IN ('Manual', 'Automatic'));
      END IF;

      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicle' AND column_name='engine_capacity') THEN
        ALTER TABLE vehicle ADD COLUMN engine_capacity INT;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_vehicle_customer ON vehicle(cusid);
    CREATE INDEX IF NOT EXISTS idx_vehicle_plate ON vehicle(vehplate);
  `;

  await pool.query(queryText);
};

export default createVehicleTable;
