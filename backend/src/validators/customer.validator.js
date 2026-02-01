import Joi from "joi";

export const customerValidator = {
  createCustomer: Joi.object({
    title: Joi.string()
      .valid("Mr.", "Mrs.", "Ms.", "Ven.", "Rev.")
      .required()
      .messages({
        "any.only": "Please select a valid title",
        "any.required": "Title is required",
      }),
    firstName: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "First name cannot be empty",
      "string.max": "First name must not exceed 100 characters",
      "any.required": "First name is required",
    }),
    lastName: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "Last name cannot be empty",
      "string.max": "Last name must not exceed 100 characters",
      "any.required": "Last name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Must be a valid email address",
      "any.required": "Email is required",
    }),
    telephone: Joi.string()
      .regex(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits",
        "any.required": "Phone number is required",
      }),
    nic: Joi.string().allow("", null),
    dob: Joi.date().iso().allow("", null),
    latitude: Joi.number().min(-90).max(90).allow(null),
    longitude: Joi.number().min(-180).max(180).allow(null),
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),
  }),

  updateCustomer: Joi.object({
    title: Joi.string().valid("Mr.", "Mrs.", "Ms.", "Ven.", "Rev."),
    firstName: Joi.string().min(1).max(100).trim(),
    lastName: Joi.string().min(1).max(100).trim(),
    email: Joi.string().email(),
    telephone: Joi.string().regex(/^[0-9]{10}$/),
    nic: Joi.string().allow("", null),
    dob: Joi.date().iso().allow("", null),
    latitude: Joi.number().min(-90).max(90).allow(null),
    longitude: Joi.number().min(-180).max(180).allow(null),
  }).min(1),

  loginCustomer: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Must be a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),
};
