import logger from '../configs/logger.js';
const errorHandling = (err, req, res, next) => {
  let status = 500;
  let message = "Internal Server Error";
  let errors = null;

  // Log full error for debugging
  logger.error(`[${new Date().toISOString()}] Error:`, err);

  // Custom application errors with explicit status codes
  if (err.statusCode) {
    status = err.statusCode;
    message = err.message || message;
    errors = err.details || err.errors || errors;
  }
  // PostgreSQL Database Errors
  else if (err.code) {
    // Unique constraint violation
    if (err.code === "23505") {
      status = 409;
      message = "Resource already exists";
      const field = err.detail?.match(/Key \((.*?)\)/)?.[1] || "field";
      errors = [{ field, message: `${field} already in use` }];
    }
    // Foreign key violation
    else if (err.code === "23503") {
      status = 400;
      message = "Invalid reference to related resource";
    }
    // Check constraint violation
    else if (err.code === "23514") {
      status = 400;
      message = "Check constraint violation: " + (err.message || err.detail || "Invalid data provided");
    }
    // Other database errors
    else {
      status = 400;
      message = "Database error";
    }
  }
  // Custom Application Errors
  else if (err.name === "ValidationError") {
    status = 400;
    message = err.message || "Validation Error";
    errors = err.details || errors;
  } else if (err.name === "NotFoundError") {
    status = 404;
    message = err.message || "Resource not found";
  } else if (err.name === "UnauthorizedError") {
    status = 401;
    message = err.message || "Unauthorized";
  } else if (err.name === "ForbiddenError") {
    status = 403;
    message = err.message || "Forbidden";
  }
  // JWT/Authentication Errors
  else if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }
  // Validation Errors (from Joi)
  else if (err.isJoi || (err.details && !err.message)) {
    status = 400;
    message = "Validation Error";
    errors = err.details;
  }
  // Generic Error Messages
  else if (err.message) {
    // Map common error messages to status codes
    if (err.message.includes("not found")) {
      status = 404;
      message = err.message;
    } else if (err.message.includes("already exists")) {
      status = 409;
      message = err.message;
    } else if (
      err.message.includes("unauthorized") ||
      err.message.includes("not authorized")
    ) {
      status = 401;
      message = err.message;
    } else if (
      err.message.includes("invalid") ||
      err.message.includes("Invalid")
    ) {
      status = 400;
      message = err.message;
    } else {
      status = 500;
      message = "Internal Server Error";
    }
  }

  // Build response
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  // Don't expose sensitive error details in production
  if (
    process.env.NODE_ENV !== "production" &&
    err.message &&
    (status === 500 || status === 400)
  ) {
    // If it's a DB error, make the message more descriptive for debugging
    if (message === "Database error") {
      response.message = `Database error: ${err.message}`;
    }

    response.debug = {
      error: err.message,
      stack: err.stack,
      code: err.code,
      detail: err.detail,
    };
  }

  res.status(status).json(response);
};

export default errorHandling;
