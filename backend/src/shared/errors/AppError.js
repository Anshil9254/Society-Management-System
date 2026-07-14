/**
 * AppError — Base class for all operational errors in the application.
 *
 * "Operational" means something went wrong that we anticipated (bad input,
 * missing resource, permission denied) — as opposed to a programming bug
 * (typo, null reference) which should crash loudly.
 *
 * Every custom error class in this project extends AppError so the central
 * error handler (errorHandler.middleware.js) can distinguish expected errors
 * from unexpected ones and format the response accordingly.
 */
class AppError extends Error {
  /**
   * @param {string} message — Human-readable error description
   * @param {number} statusCode — HTTP status code (e.g. 400, 404, 500)
   * @param {string} errorCode — Machine-readable code for frontend/logging (e.g. 'NOT_FOUND')
   */
  constructor(message, statusCode, errorCode) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;

    // Marks this as an anticipated error, not a programming bug.
    // The error handler uses this flag to decide whether to show the
    // error message to the client or return a generic "Internal Server Error".
    this.isOperational = true;

    // Captures the stack trace without including the constructor call itself,
    // so the trace starts from where the error was actually thrown.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
