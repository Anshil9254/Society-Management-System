const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for authentication endpoints.
 * Prevents brute-force attacks on login and registration.
 * 10 attempts per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,  // Return rate-limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
  skipSuccessfulRequests: false, // Count successful attempts too
});

/**
 * General API rate limiter — lenient, prevents abuse of public endpoints.
 * 100 requests per 5 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please slow down.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});

module.exports = { authLimiter, generalLimiter };
