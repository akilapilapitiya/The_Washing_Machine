export class AppError extends Error {
  constructor(message, statusCode = 500, details = null, name = "AppError") {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    if (details) this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details = null) {
    super(message, 404, details, "NotFoundError");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details = null) {
    super(message, 401, details, "UnauthorizedError");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details = null) {
    super(message, 403, details, "ForbiddenError");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation Error", details = null) {
    super(message, 400, details, "ValidationError");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details = null) {
    super(message, 409, details, "ConflictError");
  }
}
