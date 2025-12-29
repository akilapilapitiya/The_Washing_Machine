import Joi from 'joi';

export const bookingValidator = {
  createBooking: Joi.object({
    bookingdate: Joi.date()
      .iso()
      .required()
      .messages({
        'date.base': 'Booking date must be a valid date',
        'any.required': 'Booking date is required',
      }),
    bookingstarttime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'Start time must be in HH:mm format',
        'any.required': 'Start time is required',
      }),
    bookingendtime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'End time must be in HH:mm format',
        'any.required': 'End time is required',
      }),
    bookinglocationlatitude: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required',
      }),
    bookinglocationlongitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required',
      }),
    vehid: Joi.string()
      .length(7)
      .required()
      .messages({
        'string.length': 'Vehicle ID must be exactly 7 characters',
        'any.required': 'Vehicle ID is required',
      }),
  }),

  updateBooking: Joi.object({
    bookingstatus: Joi.string()
      .valid('pending', 'inProgress', 'completed', 'paid')
      .messages({
        'any.only': 'Booking status must be one of: pending, inProgress, completed, paid',
      }),
    bookingdate: Joi.date().iso(),
    bookingstarttime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    bookingendtime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    bookinglocationlatitude: Joi.number()
      .min(-90)
      .max(90),
    bookinglocationlongitude: Joi.number()
      .min(-180)
      .max(180),
  }).min(1),
};
