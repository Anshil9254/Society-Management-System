const { requireAuth, requireRole } = require('./auth.middleware');
const auditLog = require('./audit.middleware');
const validate = require('./validate.middleware');
const errorHandler = require('./errorHandler.middleware');

module.exports = {
  requireAuth,
  requireRole,
  auditLog,
  validate,
  errorHandler,
};
