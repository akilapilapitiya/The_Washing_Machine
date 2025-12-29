const errorHandling = (err, req, res, next) => {
  let status = 500;
  let message = "Internal Server Error";
  let errors = null;

  // Log full error for debugging
  console.error(`[${new Date().toISOString()}] Error:`, err);

  // PostgreSQL Database Errors
  if (err.code) {
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
      message = "Invalid data provided";
    }
    // Other database errors
    else {
      status = 400;
      message = "Database error";
    }
  }
  // Validation Errors (from Joi and manual validation)
  else if (err.isJoi || err.details) {
    status = 400;
    message = "Validation Error";
    errors = err.details;
  }
  // JWT/Authentication Errors
  else if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }
  // Custom Application Errors
  else if (err.name === "NotFoundError") {
    status = 404;
    message = err.message || "Resource not found";
  } else if (err.name === "UnauthorizedError") {
    status = 401;
    message = err.message || "Unauthorized";
  } else if (err.name === "ForbiddenError") {
    status = 403;
    message = err.message || "Forbidden";
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
    } else if (err.message.includes("unauthorized") || err.message.includes("not authorized")) {
      status = 401;
      message = err.message;
    } else if (err.message.includes("invalid") || err.message.includes("Invalid")) {
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
  if (process.env.NODE_ENV !== "production" && err.message && status === 500) {
    response.debug = {
      error: err.message,
      stack: err.stack,
    };
  }

  res.status(status).json(response);
};

export default errorHandling;
