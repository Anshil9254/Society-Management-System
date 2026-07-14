const AppError = require('./AppError');

/**
 * 409 — A conflict with existing data (e.g. duplicate email, bill already exists).
 */
class ConflictError extends AppError {
  constructor(message = 'A conflict occurred with existing data.') {
    super(message, 409, 'CONFLICT');
  }
}

module.exports = ConflictError;
