const AppError = require('./AppError');

/** 400 — The request is malformed or contains invalid data. */
class BadRequestError extends AppError {
  constructor(message = 'Bad request.') {
    super(message, 400, 'BAD_REQUEST');
  }
}

module.exports = BadRequestError;
