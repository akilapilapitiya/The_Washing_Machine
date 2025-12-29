import Joi from 'joi';

export const employeeValidator = {
  createEmployee: Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.empty': 'Employee name cannot be empty',
        'string.max': 'Employee name must not exceed 100 characters',
        'any.required': 'Employee name is required',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Must be a valid email address',
        'any.required': 'Email is required',
      }),
    telephone: Joi.string()
      .regex(/^[0-9]{10}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits',
        'any.required': 'Phone number is required',
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
      }),
    job: Joi.string()
      .max(100)
      .required()
      .messages({
        'any.required': 'Job title is required',
      }),
  }),

  updateEmployee: Joi.object({
    name: Joi.string()
      .min(1)
      .max(100)
      .trim(),
    email: Joi.string()
      .email()
      .messages({
        'string.email': 'Must be a valid email address',
      }),
    telephone: Joi.string()
      .regex(/^[0-9]{10}$/)
      .messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits',
      }),
    job: Joi.string()
      .max(100),
  }).min(1),

  loginEmployee: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Must be a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),
};
