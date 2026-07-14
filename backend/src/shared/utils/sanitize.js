/**
 * Recursively trims leading/trailing whitespace from string values in an object.
 * Leaves non-string values untouched.
 *
 * @param {Object} obj - Request body or payload to sanitize
 * @returns {Object} A new sanitized object
 */
const sanitizeBody = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? obj.trim() : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeBody);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeBody(value);
  }
  
  return sanitized;
};

/**
 * Normalizes an email address by trimming and converting to lowercase.
 * @param {string} email 
 * @returns {string}
 */
const normalizeEmail = (email) => {
  return email ? email.trim().toLowerCase() : email;
};

module.exports = {
  sanitizeBody,
  normalizeEmail,
};
