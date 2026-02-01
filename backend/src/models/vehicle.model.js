const createVehicleTable = async (pool) => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS vehicle (
      id SERIAL PRIMARY KEY,
      vehplate VARCHAR(20) NOT NULL CHECK (LENGTH(TRIM(vehplate)) > 0),
      vehmileage INT NOT NULL DEFAULT 0 CHECK (vehmileage >= 0),
      vehbrand VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(vehbrand)) > 0),
      vehmodel VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(vehmodel)) > 0),
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
    
    CREATE INDEX IF NOT EXISTS idx_vehicle_customer ON vehicle(cusid);
    CREATE INDEX IF NOT EXISTS idx_vehicle_plate ON vehicle(vehplate);
  `;

  await pool.query(queryText);
};

export default createVehicleTable;
