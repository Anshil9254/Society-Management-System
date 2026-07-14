const container = require('../../container');
const logger = require('../utils/logger');

/**
 * Fields that must NEVER be stored in audit logs.
 * Add any new sensitive field names here as the API grows.
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'password_hash',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'refreshToken',
  'accessToken',
  'token',
  'secret',
  'cardNumber',
  'cvv',
  'otp',
  'pin',
]);

/**
 * Recursively removes sensitive keys from any object before it's stored.
 * @param {*} obj 
 * @returns Sanitized copy of the object
 */
function sanitizeAuditBody(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeAuditBody);

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeAuditBody(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Middleware to automatically log audit events for sensitive actions.
 * Assumes `req.user` is populated by `requireAuth`.
 * 
 * @param {string} action - The action being performed (e.g., 'UPDATE_COMPLAINT')
 * @param {string} entityType - The type of entity (e.g., 'Complaint')
 * @param {Function} getEntityId - A function to extract the entity ID from the request (e.g., req => req.params.id)
 */
const auditLog = (action, entityType, getEntityId) => {
  return async (req, res, next) => {
    // We hook into the response finish event to ensure we only log successful actions
    res.on('finish', async () => {
      // Only log on successful creation/update/deletion (200, 201, 204)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const prisma = container.get('prisma');
          const userId = req.user ? req.user.id : null;
          const entityId = getEntityId(req);

          // Sanitize body before storing — strip passwords, tokens, PII
          const safeBody = sanitizeAuditBody(req.body);

          // We don't block the request if audit fails, so we swallow errors
          await prisma.auditLog.create({
            data: {
              userId,
              action,
              entityType,
              entityId: entityId || 'unknown',
              details: {
                method: req.method,
                url: req.originalUrl,
                body: safeBody,
              },
              ipAddress: req.ip || req.connection?.remoteAddress,
            },
          });
        } catch (error) {
          logger.error('Failed to create audit log', { error: error.message, action, entityType });
        }
      }
    });

    next();
  };
};

module.exports = auditLog;
