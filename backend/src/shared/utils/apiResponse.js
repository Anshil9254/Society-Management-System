/**
 * Standardized API response format.
 * Ensures every response has a predictable { success, data, message } structure.
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable message
 * @param {Object|Array} [data=null] - Payload
 */
const apiResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  });
};

module.exports = apiResponse;
