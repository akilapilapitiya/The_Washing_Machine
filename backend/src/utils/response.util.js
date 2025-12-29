export const successResponse = (res, statusCode, message, data = {}) => {
  const body = {
    success: true,
    message,
  };

  if (data && Object.keys(data).length > 0) {
    body.data = data;
  }

  return res.status(statusCode).json(body);
};
