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
  has_offer,
  offer_price,
  offer_description,
  servicetype = "package",
}) => {
  assertRequiredFields({ servicename, servicetime, serviceprice }, [
    "servicename",
    "servicetime",
    "serviceprice",
  ]);
  assertPositiveNumber(serviceprice, "serviceprice");

  const result = await pool.query(
    `
    INSERT INTO service (servicename, servicetime, serviceprice, servicedetails, has_offer, offer_price, offer_description, servicetype)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `,
    [
      servicename,
      servicetime,
      serviceprice,
      servicedetails,
      has_offer || false,
      offer_price || null,
      offer_description || null,
      servicetype,
    ],
  );

  return result.rows[0];
};

/**
 * GET ALL SERVICES
 */
export const getAllServicesService = async () => {
  const result = await pool.query(
    `
    SELECT *
    FROM service
    ORDER BY created_at DESC
    `,
  );

  return result.rows;
};

/**
 * GET SINGLE SERVICE
 */
export const getServiceService = async (serviceid) => {
  const result = await pool.query(
    `
    SELECT *
    FROM service
    WHERE serviceid = $1
    `,
    [serviceid],
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
  const {
    servicename,
    servicetime,
    serviceprice,
    servicedetails,
    has_offer,
    offer_price,
    offer_description,
    servicetype,
  } = updates;

  assertAtLeastOneField(updates, [
    "servicename",
    "servicetime",
    "serviceprice",
    "servicedetails",
    "has_offer",
    "offer_price",
    "offer_description",
    "servicetype",
  ]);

  if (serviceprice) assertPositiveNumber(serviceprice, "serviceprice");

  const result = await pool.query(
    `
    UPDATE service
    SET servicename = COALESCE($1, servicename),
        servicetime = COALESCE($2, servicetime),
        serviceprice = COALESCE($3, serviceprice),
        servicedetails = COALESCE($4, servicedetails),
        has_offer = COALESCE($5, has_offer),
        offer_price = COALESCE($6, offer_price),
        offer_description = COALESCE($7, offer_description),
        servicetype = COALESCE($8, servicetype),
        updated_at = NOW()
    WHERE serviceid = $9
    RETURNING *
    `,
    [
      servicename,
      servicetime,
      serviceprice,
      servicedetails,
      has_offer,
      offer_price,
      offer_description,
      servicetype,
      serviceid,
    ],
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
