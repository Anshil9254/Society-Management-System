const AppError = require('./AppError');

/**
 * 422 — Input validation failed. Carries field-level error details
 * so the frontend can show inline messages next to specific form fields.
 */
class ValidationError extends AppError {
  /**
   * @param {string} message — Summary message
   * @param {Object} fieldErrors — { fieldName: ['error message', ...] }
   */
  constructor(message = 'Validation failed.', fieldErrors = {}) {
    super(message, 422, 'VALIDATION_ERROR');
    this.fieldErrors = fieldErrors;
  }
}

module.exports = ValidationError;
