import {
  createServiceService,
  getAllServicesService,
  getServiceService,
  updateServiceService,
  deleteServiceService,
} from "../services/service.service.js";
import { successResponse } from "../utils/response.util.js";

export const createService = async (req, res, next) => {
  try {
    const {
      servicename,
      servicetime,
      serviceprice,
      servicedetails,
      short_description,
      long_description,
      gallery_urls,
      benefits,
      category,
      is_featured,
      is_variable_price,
      has_offer,
      offer_price,
      offer_description,
      offer_start_date,
      offer_end_date,
      servicetype,
    } = req.body;

    let image_url = req.body.image_url;
    if (req.file) {
      image_url = `/uploads/services/${req.file.filename}`;
    }

    const service = await createServiceService({
      servicename,
      servicetime,
      serviceprice,
      servicedetails,
      short_description,
      long_description,
      image_url,
      gallery_urls:
        typeof gallery_urls === "string"
          ? JSON.parse(gallery_urls)
          : gallery_urls, // Handle formData array string
      benefits: typeof benefits === "string" ? JSON.parse(benefits) : benefits, // Handle formData array string
      category,
      is_featured,
      is_variable_price,
      has_offer,
      offer_price,
      offer_description,
      offer_start_date,
      offer_end_date,
      servicetype,
    });

    successResponse(res, 201, "Service created successfully", { service });
  } catch (error) {
    next(error);
  }
};

export const getAllServices = async (req, res, next) => {
  try {
    const services = await getAllServicesService();

    successResponse(res, 200, "Services retrieved successfully", { services });
  } catch (error) {
    next(error);
  }
};

export const getService = async (req, res, next) => {
  try {
    const { serviceid } = req.params;

    const service = await getServiceService(serviceid);

    successResponse(res, 200, "Service retrieved successfully", { service });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { serviceid } = req.params;
    const updates = { ...req.body };

    if (req.file) {
      updates.image_url = `/uploads/services/${req.file.filename}`;
    }

    // Handle array parsing from FormData if necessary
    if (typeof updates.gallery_urls === "string") {
      try {
        updates.gallery_urls = JSON.parse(updates.gallery_urls);
      } catch (e) {}
    }
    if (typeof updates.benefits === "string") {
      try {
        updates.benefits = JSON.parse(updates.benefits);
      } catch (e) {}
    }

    const service = await updateServiceService(serviceid, updates);

    successResponse(res, 200, "Service updated successfully", { service });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const { serviceid } = req.params;

    await deleteServiceService(serviceid);

    successResponse(res, 200, "Service deleted successfully");
  } catch (error) {
    next(error);
  }
};
