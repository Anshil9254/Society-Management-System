const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');

/**
 * Generates an Access Token (short-lived).
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT Token
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, authConfig.accessSecret, {
    expiresIn: authConfig.accessExpiry,
  });
};

/**
 * Generates a Refresh Token (long-lived).
 * Includes a `jti` (JWT ID) for targeted revocation.
 * @param {string} userId - User ID
 * @param {string} jti - Unique token identifier
 * @returns {string} JWT Token
 */
const generateRefreshToken = (userId, jti) => {
  return jwt.sign({ id: userId, jti }, authConfig.refreshSecret, {
    expiresIn: authConfig.refreshExpiry,
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
