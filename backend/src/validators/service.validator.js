import Joi from "joi";

export const serviceValidator = {
  createService: Joi.object({
    servicename: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "Service name cannot be empty",
      "string.max": "Service name must not exceed 100 characters",
      "any.required": "Service name is required",
    }),
    servicedescription: Joi.string().trim().messages({
      "string.base": "Service description must be text",
    }),
    serviceprice: Joi.number().positive().required().messages({
      "number.positive": "Service price must be a positive number",
      "any.required": "Service price is required",
    }),
    serviceduration: Joi.number().positive().required().messages({
      "number.positive": "Service duration must be a positive number",
      "any.required": "Service duration is required",
    }),
  }),

  updateService: Joi.object({
    servicename: Joi.string().min(1).max(100).trim().messages({
      "string.empty": "Service name cannot be empty",
      "string.max": "Service name must not exceed 100 characters",
    }),
    servicedescription: Joi.string().trim(),
    serviceprice: Joi.number().positive().messages({
      "number.positive": "Service price must be a positive number",
    }),
    serviceduration: Joi.number().positive().messages({
      "number.positive": "Service duration must be a positive number",
    }),
  }).min(1),
};
