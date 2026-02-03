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
  short_description,
  long_description,
  image_url,
  gallery_urls = [],
  benefits = [],
  category,
  is_featured = false,
  is_variable_price = false,
  offer_start_date,
  offer_end_date,
}) => {
  assertRequiredFields({ servicename, servicetime, serviceprice }, [
    "servicename",
    "servicetime",
    "serviceprice",
  ]);
  assertPositiveNumber(serviceprice, "serviceprice");

  const result = await pool.query(
    `
    INSERT INTO service (
      servicename, servicetime, serviceprice, servicedetails, 
      short_description, long_description, image_url, gallery_urls, 
      benefits, category, is_featured, is_variable_price,
      has_offer, offer_price, offer_description, offer_start_date, offer_end_date,
      servicetype
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
    `,
    [
      servicename,
      servicetime,
      serviceprice,
      servicedetails,
      short_description || null,
      long_description || null,
      image_url || null,
      JSON.stringify(gallery_urls),
      JSON.stringify(benefits),
      category || null,
      is_featured,
      is_variable_price,
      has_offer || false,
      offer_price || null,
      offer_description || null,
      offer_start_date || null,
      offer_end_date || null,
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
    offer_description,
    servicetype,
    short_description,
    long_description,
    image_url,
    gallery_urls,
    benefits,
    category,
    is_featured,
    is_variable_price,
    offer_start_date,
    offer_end_date,
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
    "short_description",
    "long_description",
    "image_url",
    "gallery_urls",
    "benefits",
    "category",
    "is_featured",
    "is_variable_price",
    "offer_start_date",
    "offer_end_date",
  ]);

  if (serviceprice) assertPositiveNumber(serviceprice, "serviceprice");

  const result = await pool.query(
    `
    UPDATE service
    SET servicename = COALESCE($1, servicename),
        servicetime = COALESCE($2, servicetime),
        serviceprice = COALESCE($3, serviceprice),
        servicedetails = COALESCE($4, servicedetails),
        short_description = COALESCE($5, short_description),
        long_description = COALESCE($6, long_description),
        image_url = COALESCE($7, image_url),
        gallery_urls = COALESCE($8, gallery_urls),
        benefits = COALESCE($9, benefits),
        category = COALESCE($10, category),
        is_featured = COALESCE($11, is_featured),
        is_variable_price = COALESCE($12, is_variable_price),
        has_offer = COALESCE($13, has_offer),
        offer_price = COALESCE($14, offer_price),
        offer_description = COALESCE($15, offer_description),
        offer_start_date = COALESCE($16, offer_start_date),
        offer_end_date = COALESCE($17, offer_end_date),
        servicetype = COALESCE($18, servicetype),
        updated_at = NOW()
    WHERE serviceid = $19
    RETURNING *
    `,
    [
      servicename,
      servicetime,
      serviceprice,
      servicedetails,
      short_description,
      long_description,
      image_url,
      gallery_urls ? JSON.stringify(gallery_urls) : null,
      benefits ? JSON.stringify(benefits) : null,
      category,
      is_featured,
      is_variable_price,
      has_offer,
      offer_price,
      offer_description,
      offer_start_date,
      offer_end_date,
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
  const serviceRes = await pool.query(
    "SELECT image_url, gallery_urls FROM service WHERE serviceid = $1",
    [serviceid],
  );

  if (serviceRes.rowCount === 0) {
    throw new NotFoundError("Service not found");
  }

  // Potential physical asset cleanup would go here
  // For now, we'll just delete the database record
  // If we had a file utility, we'd use it to remove serviceRes.rows[0].image_url etc.

  const result = await pool.query("DELETE FROM service WHERE serviceid = $1", [
    serviceid,
  ]);

  return result.rows[0];
};
