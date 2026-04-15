import { ValidationError } from "./errors.util.js";

export const validationError = (message, details = []) =>
  new ValidationError(message, details);

export const assertRequiredFields = (payload, requiredFields) => {
  const missing = requiredFields.filter(
    (field) =>
      payload[field] === undefined ||
      payload[field] === null ||
      payload[field] === "",
  );

  if (missing.length) {
    throw validationError(
      "Missing required fields",
      missing.map((field) => ({
        field,
        message: "This field is required",
      })),
    );
  }
};

export const assertAtLeastOneField = (payload, allowedFields) => {
  const hasField = allowedFields.some((field) => payload[field] !== undefined);
  if (!hasField) {
    throw validationError(
      "No fields provided for update",
      allowedFields.map((field) => ({
        field,
        message: "Provide at least one field to update",
      })),
    );
  }
};

export const assertPositiveNumber = (value, field) => {
  if (value !== undefined && value !== null && Number(value) <= 0) {
    throw validationError(`${field} must be greater than 0`, [
      {
        field,
        message: `${field} must be greater than 0`,
      },
    ]);
  }
};

export const assertNonNegativeNumber = (value, field) => {
  if (value !== undefined && value !== null && Number(value) < 0) {
    throw validationError(`${field} cannot be negative`, [
      {
        field,
        message: `${field} cannot be negative`,
      },
    ]);
  }
};

export const assertEnum = (value, field, allowed) => {
  if (value !== undefined && value !== null && !allowed.includes(value)) {
    const allowedList = allowed.join(", ");
    throw validationError(`${field} must be one of: ${allowedList}`, [
      {
        field,
        message: `${field} must be one of: ${allowedList}`,
      },
    ]);
  }
};
