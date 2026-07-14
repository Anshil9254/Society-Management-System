const AppError = require('./AppError');

/**
 * 404 — The requested resource does not exist.
 * Pass the resource name for a specific message (e.g. "Complaint not found.").
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found.`, 404, 'NOT_FOUND');
  }
}

module.exports = NotFoundError;
