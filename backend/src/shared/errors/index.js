/**
 * Central re-export for all custom error classes.
 * Import from here instead of individual files:
 *   const { NotFoundError, ConflictError } = require('../shared/errors');
 */
const AppError = require('./AppError');
const BadRequestError = require('./BadRequestError');
const UnauthorizedError = require('./UnauthorizedError');
const ForbiddenError = require('./ForbiddenError');
const NotFoundError = require('./NotFoundError');
const ConflictError = require('./ConflictError');
const ValidationError = require('./ValidationError');

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};
