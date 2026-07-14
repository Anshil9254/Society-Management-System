const { AppError } = require('../errors');
const logger = require('../utils/logger');
const apiResponse = require('../utils/apiResponse');

/**
 * Centralized error handling middleware.
 * All errors thrown in async handlers end up here.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log the error
  if (err.isOperational) {
    logger.warn('Operational error:', { message: err.message, path: req.originalUrl });
  } else {
    logger.error('Programming error or unhandled exception:', { error: err, stack: err.stack, path: req.originalUrl });
  }

  // Handle expected AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      ...(err.fieldErrors && { errors: err.fieldErrors }),
    });
  }

  // Handle Prisma errors (simplified mapping for now)
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate record exists.',
        errorCode: 'CONFLICT',
      });
    }
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload.',
      errorCode: 'BAD_REQUEST',
    });
  }

  // Fallback for unexpected errors
  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: isProduction ? 'Internal Server Error' : err.message,
    errorCode: 'INTERNAL_SERVER_ERROR',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
