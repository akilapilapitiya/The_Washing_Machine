const createVehicleCatalogTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS vehicle_catalog (
      id SERIAL PRIMARY KEY,
      brand VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(brand)) > 0),
      model VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(model)) > 0),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(brand, model)
    );
    
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
