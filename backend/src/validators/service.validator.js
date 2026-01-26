import Joi from "joi";

export const serviceValidator = {
  createService: Joi.object({
    servicename: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "Service name cannot be empty",
      "string.max": "Service name must not exceed 100 characters",
      "any.required": "Service name is required",
    }),
    servicedetails: Joi.string().trim().required().messages({
      "string.base": "Service details must be text",
      "any.required": "Service details is required",
    }),
    serviceprice: Joi.number().positive().required().messages({
      "number.positive": "Service price must be a positive number",
      "any.required": "Service price is required",
    }),
    servicetime: Joi.string()
      .pattern(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
      .required()
      .messages({
        "string.pattern.base": "Service time must be in HH:mm format",
        "any.required": "Service time is required",
      }),
    has_offer: Joi.boolean(),
    offer_price: Joi.number().allow(null),
    offer_price: Joi.number().allow(null),
    offer_description: Joi.string().allow(null, ""),
    servicetype: Joi.string().valid("package", "addon").default("package"),
  }),

  updateService: Joi.object({
    servicename: Joi.string().min(1).max(100).trim().messages({
      "string.empty": "Service name cannot be empty",
      "string.max": "Service name must not exceed 100 characters",
    }),
    servicedetails: Joi.string().trim(),
    serviceprice: Joi.number().positive().messages({
      "number.positive": "Service price must be a positive number",
    }),
    servicetime: Joi.string()
      .pattern(/^([0-1]?\d|2[0-3]):[0-5]\d$/)
      .messages({
        "string.pattern.base": "Service time must be in HH:mm format",
      }),
    has_offer: Joi.boolean(),
    offer_price: Joi.number().allow(null),
    offer_price: Joi.number().allow(null),
    offer_description: Joi.string().allow(null, ""),
    servicetype: Joi.string().valid("package", "addon"),
  }).min(1),
};
