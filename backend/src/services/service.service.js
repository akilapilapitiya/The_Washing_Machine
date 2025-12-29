import pool from "../configs/database.js";
import {
  assertAtLeastOneField,
  assertPositiveNumber,
  assertRequiredFields,
} from "../utils/validation.util.js";
import { NotFoundError } from "../utils/errors.util.js";

/**
 * CREATE SERVICE
 */
export const createServiceService = async ({
  servicename,
  servicetime,
  serviceprice,
  servicedetails,
}) => {
  assertRequiredFields(
    { servicename, servicetime, serviceprice },
    ["servicename", "servicetime", "serviceprice"]
  );
  assertPositiveNumber(serviceprice, "serviceprice");
  assertPositiveNumber(servicetime, "servicetime");

  const result = await pool.query(
    `
    INSERT INTO service (servicename, servicetime, serviceprice, servicedetails)
    VALUES ($1, $2, $3, $4)
    RETURNING serviceid, servicename, servicetime, serviceprice, servicedetails
    `,
    [servicename, servicetime, serviceprice, servicedetails]
  );

  return result.rows[0];
};

/**
 * GET ALL SERVICES
 */
export const getAllServicesService = async () => {
  const result = await pool.query(
    `
    SELECT serviceid, servicename, servicetime, serviceprice, servicedetails, created_at, updated_at
    FROM service
    ORDER BY created_at DESC
    `
  );

  return result.rows;
};

/**
 * GET SINGLE SERVICE
 */
export const getServiceService = async (serviceid) => {
  const result = await pool.query(
    `
    SELECT serviceid, servicename, servicetime, serviceprice, servicedetails, created_at, updated_at
    FROM service
    WHERE serviceid = $1
    `,
    [serviceid]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Service not found");
  }

  return result.rows[0];
};

/**
 * UPDATE SERVICE
 */
export const updateServiceService = async (serviceid, updates) => {
  const { servicename, servicetime, serviceprice, servicedetails } = updates;

  assertAtLeastOneField(updates, ["servicename", "servicetime", "serviceprice", "servicedetails"]);
  assertPositiveNumber(serviceprice, "serviceprice");
  assertPositiveNumber(servicetime, "servicetime");

  const result = await pool.query(
    `
    UPDATE service
    SET servicename = COALESCE($1, servicename),
        servicetime = COALESCE($2, servicetime),
        serviceprice = COALESCE($3, serviceprice),
        servicedetails = COALESCE($4, servicedetails),
        updated_at = NOW()
    WHERE serviceid = $5
    RETURNING serviceid, servicename, servicetime, serviceprice, servicedetails
    `,
    [servicename, servicetime, serviceprice, servicedetails, serviceid]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Service not found");
  }

  return result.rows[0];
};

/**
 * DELETE SERVICE
 */
export const deleteServiceService = async (serviceid) => {
  const result = await pool.query("DELETE FROM service WHERE serviceid = $1", [
    serviceid,
  ]);

  if (result.rowCount === 0) {
    throw new NotFoundError("Service not found");
  }
};
