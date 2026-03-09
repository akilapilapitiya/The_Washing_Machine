import Joi from "joi";

export const serviceValidator = {
  createService: Joi.object({
    servicename: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "Service name cannot be empty",
      "string.max": "Service name must not exceed 100 characters",
      "any.required": "Service name is required",
    }),
    servicedetails: Joi.string().trim().allow("", null), // Deprecated but kept for compatibility
    short_description: Joi.string().trim().max(255).allow("", null),
    long_description: Joi.string().trim().allow("", null),
    image_url: Joi.string().uri().allow("", null),
    gallery_urls: Joi.array().items(Joi.string().uri()).default([]),
    benefits: Joi.array().items(Joi.string().trim()).default([]),
    category: Joi.string().max(50).allow("", null),
    is_featured: Joi.boolean().default(false),
    is_variable_price: Joi.boolean().default(false),
    serviceprice: Joi.number().min(0).required().messages({
      "number.min": "Service price must not be negative",
      "any.required": "Service price is required",
    }),
    servicetime: Joi.string()
      .pattern(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
      .required()
      .messages({
        "string.pattern.base": "Service time must be in HH:mm format",
        "any.required": "Service time is required",
      }),
    has_offer: Joi.boolean().default(false),
    offer_price: Joi.number().min(0).allow(null),
    offer_description: Joi.string().allow(null, ""),
    offer_start_date: Joi.date().iso().allow(null),
    offer_end_date: Joi.date().iso().allow(null),
    servicetype: Joi.string().valid("package", "addon").default("package"),
  }),

  updateService: Joi.object({
    servicename: Joi.string().min(1).max(100).trim().messages({
      "string.empty": "Service name cannot be empty",
      "string.max": "Service name must not exceed 100 characters",
    }),
    servicedetails: Joi.string().trim().allow("", null),
    short_description: Joi.string().trim().max(255).allow("", null),
    long_description: Joi.string().trim().allow("", null),
    image_url: Joi.string().uri().allow("", null),
    gallery_urls: Joi.array().items(Joi.string().uri()),
    benefits: Joi.array().items(Joi.string().trim()),
    category: Joi.string().max(50).allow("", null),
    is_featured: Joi.boolean(),
    is_variable_price: Joi.boolean(),
    serviceprice: Joi.number().min(0).messages({
      "number.min": "Service price must not be negative",
    }),
    servicetime: Joi.string()
      .pattern(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
      .messages({
        "string.pattern.base": "Service time must be in HH:mm format",
      }),
    has_offer: Joi.boolean(),
    offer_price: Joi.number().min(0).allow(null),
    offer_description: Joi.string().allow(null, ""),
    offer_start_date: Joi.date().iso().allow(null),
    offer_end_date: Joi.date().iso().allow(null),
    servicetype: Joi.string().valid("package", "addon"),
  }).min(1),
};
