import pool from "../configs/database.js";

// Create a vehicle
export const createVehicleService = async ({
  customerId,
  vehid,
  vehmileage,
  vehbrand,
  vehmodel
}) => {
  const result = await pool.query(
    `
    INSERT INTO vehicle (vehid, vehmileage, vehbrand, vehmodel, cusid)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING vehid, vehmileage, vehbrand, vehmodel, cusid
    `,
    [vehid, vehmileage, vehbrand, vehmodel, customerId]
  );

  return result.rows[0];
};

// Get all Vehicles for a Customer
export const getCustomerVehiclesService = async (customerId) => {
  const result = await pool.query(
    `
    SELECT vehid, vehmileage, vehbrand, vehmodel, cusid, created_at, updated_at
    FROM vehicle
    WHERE cusid = $1
    ORDER BY created_at DESC
    `,
    [customerId]
  );

  return result.rows;
};

// Get a vehicle
export const getVehicleService = async (vehid) => {
  const result = await pool.query(
    `
    SELECT vehid, vehmileage, vehbrand, vehmodel, cusid, created_at, updated_at
    FROM vehicle
    WHERE vehid = $1
    `,
    [vehid]
  );

  if (result.rowCount === 0) {
    throw new Error("Vehicle not found");
  }

  return result.rows[0];
};

// Update a vehicle
export const updateVehicleService = async (vehid, customerId, updates) => {
  const { vehmileage, vehbrand, vehmodel } = updates;

  // First verify the vehicle belongs to the customer
  const vehicleCheck = await pool.query(
    "SELECT cusid FROM vehicle WHERE vehid = $1",
    [vehid]
  );

  if (vehicleCheck.rowCount === 0) {
    throw new Error("Vehicle not found");
  }

  if (vehicleCheck.rows[0].cusid !== customerId) {
    throw new Error("You can only update your own vehicles");
  }

  const result = await pool.query(
    `
    UPDATE vehicle
    SET vehmileage = COALESCE($1, vehmileage),
        vehbrand = COALESCE($2, vehbrand),
        vehmodel = COALESCE($3, vehmodel),
        updated_at = NOW()
    WHERE vehid = $4
    RETURNING vehid, vehmileage, vehbrand, vehmodel, cusid
    `,
    [vehmileage, vehbrand, vehmodel, vehid]
  );

  return result.rows[0];
};

//Delete a Vehicle
export const deleteVehicleService = async (vehid, customerId) => {
  // First verify the vehicle belongs to the customer
  const vehicleCheck = await pool.query(
    "SELECT cusid FROM vehicle WHERE vehid = $1",
    [vehid]
  );

  if (vehicleCheck.rowCount === 0) {
    throw new Error("Vehicle not found");
  }

  if (vehicleCheck.rows[0].cusid !== customerId) {
    throw new Error("You can only delete your own vehicles");
  }

  await pool.query(
    "DELETE FROM vehicle WHERE vehid = $1",
    [vehid]
  );
};
