import Joi from "joi";

export const vehicleValidator = {
  createVehicle: Joi.object({
    vehid: Joi.string().length(7).required().messages({
      "string.length": "Vehicle ID must be exactly 7 characters",
      "any.required": "Vehicle ID is required",
    }),
    vehtype: Joi.string().max(50).trim().required().messages({
      "string.max": "Vehicle type must not exceed 50 characters",
      "any.required": "Vehicle type is required",
    }),
    vehbrand: Joi.string().max(50).trim().required().messages({
      "string.max": "Vehicle brand must not exceed 50 characters",
      "any.required": "Vehicle brand is required",
    }),
    vehmodel: Joi.string().max(50).trim().required().messages({
      "string.max": "Vehicle model must not exceed 50 characters",
      "any.required": "Vehicle model is required",
    }),
    vehiclecolor: Joi.string().max(50).trim().required().messages({
      "string.max": "Vehicle color must not exceed 50 characters",
      "any.required": "Vehicle color is required",
    }),
  }),

  updateVehicle: Joi.object({
    vehtype: Joi.string().max(50).trim(),
    vehbrand: Joi.string().max(50).trim(),
    vehmodel: Joi.string().max(50).trim(),
    vehiclecolor: Joi.string().max(50).trim(),
  }).min(1),
};
