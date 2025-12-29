import Joi from 'joi';

export const paymentValidator = {
  createPayment: Joi.object({
    bookingid: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.positive': 'Booking ID must be a positive number',
        'any.required': 'Booking ID is required',
      }),
    paymentamount: Joi.number()
      .positive()
      .required()
      .messages({
        'number.positive': 'Payment amount must be a positive number',
        'any.required': 'Payment amount is required',
      }),
    paymentmethod: Joi.string()
      .max(50)
      .trim()
      .required()
      .messages({
        'any.required': 'Payment method is required',
      }),
  }),

  updatePayment: Joi.object({
    paymentstatus: Joi.string()
      .valid('pending', 'completed', 'failed')
      .messages({
        'any.only': 'Payment status must be one of: pending, completed, failed',
      }),
    paymentamount: Joi.number()
      .positive()
      .messages({
        'number.positive': 'Payment amount must be a positive number',
      }),
    paymentmethod: Joi.string()
      .max(50)
      .trim(),
  }).min(1),
};
