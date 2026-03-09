import Joi from "joi";

export const dependentValidator = {
  createDependent: Joi.object({
    name: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "Dependent name cannot be empty",
      "any.required": "Dependent name is required",
    }),
    relationship: Joi.string().min(1).max(50).trim().required().messages({
      "string.empty": "Relationship cannot be empty",
      "any.required": "Relationship is required",
    }),
    contact_number: Joi.string()
      .regex(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Contact number must be exactly 10 digits",
        "any.required": "Contact number is required",
      }),
    is_emergency_contact: Joi.boolean().default(true),
  }),

  updateDependent: Joi.object({
    name: Joi.string().min(1).max(100).trim(),
    relationship: Joi.string().min(1).max(50).trim(),
    contact_number: Joi.string().regex(/^[0-9]{10}$/),
    is_emergency_contact: Joi.boolean(),
  }).min(1),
};
