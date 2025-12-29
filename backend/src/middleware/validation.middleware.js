import Joi from "joi";

export const validateSchema = (schema, dataToValidate = "body") => {
  return (req, res, next) => {
    // Determine where to get data from (body, query, params, etc.)
    const { error, value } = schema.validate(req[dataToValidate], {
      abortEarly: false, // Collect all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
      convert: true, // Convert types if possible
    });

    if (error) {
      // Format error messages
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errorDetails,
      });
    }

    // Attach validated data back to request
    req[dataToValidate] = value;
    next();
  };
};
