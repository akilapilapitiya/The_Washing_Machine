const createVehicleCatalogTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS vehicle_catalog (
      id SERIAL PRIMARY KEY,
      brand VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(brand)) > 0),
      model VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(brand, model)
    );
    
    -- Migration: Relax model constraint for brand-only entries
    DO $$ 
    BEGIN 
      -- Remove NOT NULL if it exists
      ALTER TABLE vehicle_catalog ALTER COLUMN model DROP NOT NULL;
      
      -- Drop the check constraint if it exists (check name might vary, but usually involves 'model_check')
      -- We'll look for constraints matching the string length check on 'model'
      IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'vehicle_catalog_model_check'
      ) THEN
        ALTER TABLE vehicle_catalog DROP CONSTRAINT vehicle_catalog_model_check;
      END IF;
    END $$;

    -- Seed initial data
    INSERT INTO vehicle_catalog (brand, model) VALUES 
      ('Toyota', 'Corolla'),
      ('Toyota', 'Camry'),
      ('Honda', 'Civic'),
      ('Honda', 'Accord'),
      ('Nissan', 'Leaf')
    ON CONFLICT (brand, model) DO NOTHING;
    
    CREATE INDEX IF NOT EXISTS idx_vehicle_catalog_brand ON vehicle_catalog(brand);
  `;

  await pool.query(queryText);
};

export default createVehicleCatalogTable;
