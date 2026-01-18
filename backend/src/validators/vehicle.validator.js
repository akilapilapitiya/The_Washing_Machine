import Joi from "joi";

export const vehicleValidator = {
  createVehicle: Joi.object({
    vehplate: Joi.string().min(1).max(20).trim().required().messages({
      "string.min": "Vehicle plate must have at least 1 character",
      "string.max": "Vehicle plate must not exceed 20 characters",
      "any.required": "Vehicle plate is required",
    }),
    vehbrand: Joi.string().max(50).trim().required().messages({
      "string.max": "Vehicle brand must not exceed 50 characters",
      "any.required": "Vehicle brand is required",
    }),
    vehmodel: Joi.string().max(50).trim().required().messages({
      "string.max": "Vehicle model must not exceed 50 characters",
      "any.required": "Vehicle model is required",
    }),
    vehmileage: Joi.number().integer().min(0).optional().messages({
      "number.min": "Vehicle mileage must be 0 or greater",
    }),
  }),

  updateVehicle: Joi.object({
    vehmileage: Joi.number().integer().min(0).required().messages({
      "number.min": "Vehicle mileage must be 0 or greater",
      "any.required": "Vehicle mileage is required",
    }),
  }),
};
