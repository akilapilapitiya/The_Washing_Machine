import Joi from "joi";

export const vehicleValidator = {
  createVehicle: Joi.object({
    vehid: Joi.string().length(7).required().messages({
      "string.length": "Vehicle ID must be exactly 7 characters",
      "any.required": "Vehicle ID is required",
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
