import Joi from "joi";

export const customerValidator = {
  createCustomer: Joi.object({
    name: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "Customer name cannot be empty",
      "string.max": "Customer name must not exceed 100 characters",
      "any.required": "Customer name is required",
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
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),
  }),

  updateCustomer: Joi.object({
    name: Joi.string().min(1).max(100).trim().messages({
      "string.empty": "Customer name cannot be empty",
      "string.max": "Customer name must not exceed 100 characters",
    }),
    email: Joi.string().email().messages({
      "string.email": "Must be a valid email address",
    }),
    telephone: Joi.string()
      .regex(/^[0-9]{10}$/)
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits",
      }),
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
