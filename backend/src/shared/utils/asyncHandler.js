/**
 * Wraps async route handlers and passes any errors to Express's next().
 * This eliminates the need for try/catch blocks in every controller method.
 *
 * Usage:
 * router.post('/', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
