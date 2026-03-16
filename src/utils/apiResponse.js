/**
 * Standardized API response
 * All responses: { success, message, data, meta }
 */

const sendSuccess = (res, { message = 'Success', data = null, meta = null, statusCode = 200 }) => {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const sendError = (res, { message = 'Something went wrong', errors = null, statusCode = 500 }) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, { message = 'Created successfully', data = null }) =>
  sendSuccess(res, { message, data, statusCode: 201 });

const sendNotFound = (res, message = 'Resource not found') =>
  sendError(res, { message, statusCode: 404 });

const sendUnauthorized = (res, message = 'Unauthorized') =>
  sendError(res, { message, statusCode: 401 });

const sendForbidden = (res, message = 'Forbidden') =>
  sendError(res, { message, statusCode: 403 });

const sendValidationError = (res, errors) =>
  sendError(res, { message: 'Validation failed', errors, statusCode: 422 });

module.exports = {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendValidationError,
};
