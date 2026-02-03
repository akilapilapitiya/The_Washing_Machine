import Joi from "joi";

export const employeeValidator = {
  createEmployee: Joi.object({
    first_name: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "First name cannot be empty",
      "any.required": "First name is required",
    }),
    last_name: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "Last name cannot be empty",
      "any.required": "Last name is required",
    }),
    name_with_initials: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .required()
      .messages({
        "string.empty": "Name with initials cannot be empty",
        "any.required": "Name with initials is required",
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
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),
    type: Joi.string().max(100).required().messages({
      "any.required": "Job title/type is required",
    }),
    nic: Joi.string()
      .regex(/^[0-9]{9}[Vv]$|^[0-9]{12}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Invalid NIC format (9 digits + V/v or 12 digits)",
        "any.required": "NIC is required",
      }),
    address_number: Joi.string().max(20).trim().allow(null, "").optional(),
    address_line1: Joi.string().max(100).trim().allow(null, "").optional(),
    address_line2: Joi.string().max(100).trim().allow(null, "").optional(),
    dob: Joi.date().iso().allow(null, "").optional(),
    speciality: Joi.string().max(100).trim().allow(null, "").optional(),
  }),

  updateEmployee: Joi.object({
    first_name: Joi.string().min(1).max(100).trim(),
    last_name: Joi.string().min(1).max(100).trim(),
    name_with_initials: Joi.string().min(1).max(100).trim(),
    email: Joi.string().email(),
    telephone: Joi.string().regex(/^[0-9]{10}$/),
    type: Joi.string().max(100),
    nic: Joi.string(),
    address_number: Joi.string().max(20).trim(),
    address_line1: Joi.string().max(100).trim(),
    address_line2: Joi.string().max(100).trim(),
    dob: Joi.date().iso(),
    speciality: Joi.string().max(100).trim(),
  }).min(1),

  loginEmployee: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Must be a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),
};
