/**
 * Custom error class for operational errors.
 * Use this for known errors (404, 401, 400 etc.)
 */
class AppError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.assign(this, details);
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
