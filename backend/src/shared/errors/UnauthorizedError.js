const AppError = require('./AppError');

/** 401 — Authentication failed or token is missing/invalid. */
class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

module.exports = UnauthorizedError;
