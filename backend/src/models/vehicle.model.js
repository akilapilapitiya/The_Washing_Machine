const createVehicleTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS vehicle (
      vehid VARCHAR(7) PRIMARY KEY CHECK (vehid ~ '^[A-Z0-9-]{7}$'),
      vehmileage INT NOT NULL CHECK (vehmileage >= 0),
      vehbrand VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(vehbrand)) > 0),
      vehmodel VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(vehmodel)) > 0),
      cusid INT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT fk_vehicle_customer
        FOREIGN KEY (cusid)
        REFERENCES customer(cusid)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_vehicle_customer ON vehicle(cusid);
  `;

  await pool.query(queryText);
};

export default createVehicleTable;
