const env = require('./env.config');

/**
 * JWT authentication configuration.
 * Short-lived access tokens (15 min) + rotated refresh tokens (7 days)
 * is the standard pattern for session management without server-side sessions.
 */
const authConfig = Object.freeze({
  accessSecret: env.JWT_ACCESS_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessExpiry: env.JWT_ACCESS_EXPIRY,
  refreshExpiry: env.JWT_REFRESH_EXPIRY,
  bcryptSaltRounds: 12,
});

module.exports = authConfig;
