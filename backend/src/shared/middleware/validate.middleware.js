const { ValidationError } = require('../errors');

/**
 * Middleware to validate request body using Zod.
 * Replaces req.body with the sanitized/validated object as req.validatedBody
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsedData = schema.parse(req.body);
    req.validatedBody = parsedData; // DTOs will read from here
    next();
  } catch (err) {
    if (err.name === 'ZodError') {
      const details = err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Validation failed', details));
    }
    next(err);
  }
};

module.exports = validate;
