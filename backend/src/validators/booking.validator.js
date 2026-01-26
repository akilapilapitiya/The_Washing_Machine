import Joi from "joi";

export const bookingValidator = {
  createBooking: Joi.object({
    status: Joi.string()
      .valid("pending", "inProgress", "completed", "paid")
      .required(),
    date: Joi.date().iso().required().messages({
      "date.base": "Booking date must be a valid date",
      "any.required": "Booking date is required",
    }),
    startTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.pattern.base": "Start time must be in HH:mm format",
        "any.required": "Start time is required",
      }),
    locationLatitude: Joi.number().min(-90).max(90).required().messages({
      "number.min": "Latitude must be between -90 and 90",
      "number.max": "Latitude must be between -90 and 90",
      "any.required": "Latitude is required",
    }),
    locationLongitude: Joi.number().min(-180).max(180).required().messages({
      "number.min": "Longitude must be between -180 and 180",
      "number.max": "Longitude must be between -180 and 180",
      "any.required": "Longitude is required",
    }),
    vehicleId: Joi.number().integer().required().messages({
      "number.base": "Vehicle ID must be a number",
      "any.required": "Vehicle ID is required",
    }),
    services: Joi.array()
      .items(Joi.number().integer())
      .min(1)
      .required()
      .messages({
        "array.min": "At least one service must be selected",
        "any.required": "Services are required",
      }),
    employeeId: Joi.alternatives()
      .try(Joi.number().integer(), Joi.string().allow("any", ""))
      .allow(null),
  }),

  updateBooking: Joi.object({
    status: Joi.string().valid("pending", "inProgress", "completed", "paid"),
    date: Joi.date().iso(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    locationLatitude: Joi.number().min(-90).max(90),
    locationLongitude: Joi.number().min(-180).max(180),
    services: Joi.array().items(Joi.number().integer()).min(1),
    employeeId: Joi.alternatives()
      .try(Joi.number().integer(), Joi.string().allow("any", ""))
      .allow(null),
  }).min(1),
};
