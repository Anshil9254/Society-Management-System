const AppError = require('./AppError');

/** 403 — User is authenticated but lacks permission for this action. */
class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403, 'FORBIDDEN');
  }
}

module.exports = ForbiddenError;
