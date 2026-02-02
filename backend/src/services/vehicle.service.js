import pool from "../configs/database.js";
import {
  assertNonNegativeNumber,
  assertRequiredFields,
} from "../utils/validation.util.js";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../utils/errors.util.js";

// Create a vehicle
export const createVehicleService = async ({
  customerId,
  vehplate,
  vehmileage,
  vehbrand,
  vehmodel,
  fuel_type,
  vehcolor,
  manufacture_year,
  transmission,
  engine_capacity,
  next_service_mileage,
}) => {
  assertRequiredFields(
    { customerId, vehplate, vehbrand, vehmodel, fuel_type },
    ["customerId", "vehplate", "vehbrand", "vehmodel", "fuel_type"],
  );
  assertNonNegativeNumber(vehmileage, "vehmileage");

  // Check if customer already has this plate number
  const duplicateCheck = await pool.query(
    `SELECT id FROM vehicle WHERE cusid = $1 AND vehplate = $2`,
    [customerId, vehplate],
  );

  if (duplicateCheck.rowCount > 0) {
    throw new ValidationError(
      `You already have a vehicle registered with plate ${vehplate}`,
    );
  }

  const result = await pool.query(
    `
    INSERT INTO vehicle (
      vehplate, vehmileage, vehbrand, vehmodel, cusid, 
      fuel_type, vehcolor, manufacture_year, transmission, engine_capacity, next_service_mileage
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id, vehplate, vehmileage, vehbrand, vehmodel, cusid, 
              fuel_type, vehcolor, manufacture_year, transmission, engine_capacity, next_service_mileage,
              created_at, updated_at
    `,
    [
      vehplate,
      vehmileage || 0,
      vehbrand,
      vehmodel,
      customerId,
      fuel_type,
      vehcolor || null,
      manufacture_year || null,
      transmission || null,
      engine_capacity || null,
      next_service_mileage || 0,
    ],
  );

  return result.rows[0];
};

// Get all Vehicles for a Customer
export const getCustomerVehiclesService = async (customerId) => {
  const result = await pool.query(
    `
    SELECT id, vehplate, vehmileage, vehbrand, vehmodel, cusid, 
           fuel_type, vehcolor, manufacture_year, transmission, engine_capacity, next_service_mileage,
           created_at, updated_at
    FROM vehicle
    WHERE cusid = $1
    ORDER BY created_at DESC
    `,
    [customerId],
  );

  return result.rows;
};

// Get all Vehicles based on user role
export const getAllVehiclesByRoleService = async (
  userId,
  userRole,
  userEmptype,
) => {
  // Determine effective role
  const effectiveRole = userEmptype || userRole;

  // If customer, show only their vehicles
  if (userRole === "customer") {
    const result = await pool.query(
      `
      SELECT id, vehplate, vehmileage, vehbrand, vehmodel, cusid, 
             fuel_type, vehcolor, manufacture_year, transmission, engine_capacity, next_service_mileage,
             created_at, updated_at
      FROM vehicle
      WHERE cusid = $1
      ORDER BY created_at DESC
      `,
      [userId],
    );
    return result.rows;
  }

  // If manager or owner, show all vehicles
  if (effectiveRole === "manager" || effectiveRole === "owner") {
    const result = await pool.query(
      `
      SELECT id, vehplate, vehmileage, vehbrand, vehmodel, cusid, 
             fuel_type, vehcolor, manufacture_year, transmission, engine_capacity, next_service_mileage,
             created_at, updated_at
      FROM vehicle
      ORDER BY created_at DESC
      `,
    );
    return result.rows;
  }

  // Normal employee - throw error (they should only get by ID)
  throw new ForbiddenError("Employees can only view vehicles by ID");
};

// Get a vehicle by ID based on user role
export const getVehicleService = async (id, userId, userRole, userEmptype) => {
  const result = await pool.query(
    `
    SELECT id, vehplate, vehmileage, vehbrand, vehmodel, cusid, 
           fuel_type, vehcolor, manufacture_year, transmission, engine_capacity, next_service_mileage,
           created_at, updated_at
    FROM vehicle
    WHERE id = $1
    `,
    [id],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Vehicle not found");
  }

  const vehicle = result.rows[0];

  // Determine effective role
  const effectiveRole = userEmptype || userRole;

  // Authorization checks
  if (userRole === "customer") {
    // Customer can only see their own vehicles
    if (vehicle.cusid !== userId) {
      throw new ForbiddenError("You can only view your own vehicles");
    }
  } else if (userRole === "employee") {
    // Employee can access if they are manager/owner, or if they're viewing a vehicle by ID (normal employee access)
    if (effectiveRole !== "manager" && effectiveRole !== "owner") {
      // Normal employee - allowed to view any vehicle by ID
    }
  }

  return vehicle;
};

// Update a vehicle (employees only or specific updates)
export const updateVehicleService = async (id, updates) => {
  const vehicleCheck = await pool.query(
    "SELECT id FROM vehicle WHERE id = $1",
    [id],
  );

  if (vehicleCheck.rowCount === 0) {
    throw new NotFoundError("Vehicle not found");
  }

  // Filter out undefined values
  const fields = Object.entries(updates)
    .filter(([_, value]) => value !== undefined)
    .map(([key, _]) => key);

  if (fields.length === 0) {
    throw new ValidationError("No fields to update");
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");
  const values = fields.map((field) => updates[field]);
  values.push(id);

  const query = `
    UPDATE vehicle
    SET ${setClause},
        updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING id, vehplate, vehmileage, vehbrand, vehmodel, cusid, 
              fuel_type, vehcolor, manufacture_year, transmission, engine_capacity, next_service_mileage,
              created_at, updated_at
  `;

  const result = await pool.query(query, values);

  return result.rows[0];
};

//Delete a Vehicle
export const deleteVehicleService = async (id, customerId) => {
  // First verify the vehicle belongs to the customer
  const vehicleCheck = await pool.query(
    "SELECT cusid FROM vehicle WHERE id = $1",
    [id],
  );

  if (vehicleCheck.rowCount === 0) {
    throw new NotFoundError("Vehicle not found");
  }

  if (vehicleCheck.rows[0].cusid !== customerId) {
    throw new ForbiddenError("You can only delete your own vehicles");
  }

  await pool.query("DELETE FROM vehicle WHERE id = $1", [id]);
};
