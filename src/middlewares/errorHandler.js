const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const handleCastError = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists. Please use a different value.`, 409);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation error: ${errors.join('. ')}`, 422);
};

const handleJWTError = () => new AppError('Invalid token. Please login again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please login again.', 401);

const getErrorDetails = (err) => {
  const excludedKeys = new Set(['message', 'statusCode', 'isOperational', 'stack', 'name']);

  return Object.fromEntries(Object.entries(err).filter(([key]) => !excludedKeys.has(key)));
};

const sendErrorDev = (err, res) => {
  const details = getErrorDetails(err);

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...details,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    const details = getErrorDetails(err);

    res.status(err.statusCode).json({ success: false, message: err.message, ...details });
  } else {
    logger.error('UNEXPECTED ERROR:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

const errorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method}`);

  let error = { ...err, message: err.message };

  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
