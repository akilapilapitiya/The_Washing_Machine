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
}) => {
  assertRequiredFields({ customerId, vehplate, vehbrand, vehmodel }, [
    "customerId",
    "vehplate",
    "vehbrand",
    "vehmodel",
  ]);
  assertNonNegativeNumber(vehmileage, "vehmileage");
  const result = await pool.query(
    `
    INSERT INTO vehicle (vehplate, vehmileage, vehbrand, vehmodel, cusid)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, vehplate, vehmileage, vehbrand, vehmodel, cusid, created_at, updated_at
    `,
    [vehplate, vehmileage || 0, vehbrand, vehmodel, customerId]
  );

  return result.rows[0];
};

// Get all Vehicles for a Customer
export const getCustomerVehiclesService = async (customerId) => {
  const result = await pool.query(
    `
    SELECT id, vehplate, vehmileage, vehbrand, vehmodel, cusid, created_at, updated_at
    FROM vehicle
    WHERE cusid = $1
    ORDER BY created_at DESC
    `,
    [customerId]
  );

  return result.rows;
};

// Get all Vehicles based on user role
export const getAllVehiclesByRoleService = async (
  userId,
  userRole,
  userEmptype
) => {
  // Determine effective role
  const effectiveRole = userEmptype || userRole;

  // If customer, show only their vehicles
  if (userRole === "customer") {
    const result = await pool.query(
      `
      SELECT id, vehplate, vehmileage, vehbrand, vehmodel, cusid, created_at, updated_at
      FROM vehicle
      WHERE cusid = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );
    return result.rows;
  }

  // If manager or owner, show all vehicles
  if (effectiveRole === "manager" || effectiveRole === "owner") {
    const result = await pool.query(
      `
      SELECT id, vehplate, vehmileage, vehbrand, vehmodel, cusid, created_at, updated_at
      FROM vehicle
      ORDER BY created_at DESC
      `
    );
    return result.rows;
  }

  // Normal employee - throw error (they should only get by ID)
  throw new ForbiddenError("Employees can only view vehicles by ID");
};

// Get a vehicle by ID based on user role
export const getVehicleService = async (
  id,
  userId,
  userRole,
  userEmptype
) => {
  const result = await pool.query(
    `
    SELECT id, vehplate, vehmileage, vehbrand, vehmodel, cusid, created_at, updated_at
    FROM vehicle
    WHERE id = $1
    `,
    [id]
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

// Update a vehicle mileage (employees only)
export const updateVehicleService = async (id, vehmileage) => {
  if (vehmileage === undefined || vehmileage === null) {
    throw new ValidationError("Mileage is required");
  }

  if (vehmileage < 0) {
    throw new ValidationError("Mileage cannot be negative");
  }

  const vehicleCheck = await pool.query(
    "SELECT id FROM vehicle WHERE id = $1",
    [id]
  );

  if (vehicleCheck.rowCount === 0) {
    throw new NotFoundError("Vehicle not found");
  }

  const result = await pool.query(
    `
    UPDATE vehicle
    SET vehmileage = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING id, vehplate, vehmileage, vehbrand, vehmodel, cusid, created_at, updated_at
    `,
    [vehmileage, id]
  );

  return result.rows[0];
};

//Delete a Vehicle
export const deleteVehicleService = async (id, customerId) => {
  // First verify the vehicle belongs to the customer
  const vehicleCheck = await pool.query(
    "SELECT cusid FROM vehicle WHERE id = $1",
    [id]
  );

  if (vehicleCheck.rowCount === 0) {
    throw new NotFoundError("Vehicle not found");
  }

  if (vehicleCheck.rows[0].cusid !== customerId) {
    throw new ForbiddenError("You can only delete your own vehicles");
  }

  await pool.query("DELETE FROM vehicle WHERE id = $1", [id]);
};
