const express = require('express');
const { registerSchema, loginSchema, refreshTokenSchema } = require('./auth.validator');
const validate = require('../../shared/middleware/validate.middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { authLimiter } = require('../../shared/middleware/rateLimiter.middleware');

// DI setup: getting instances from the container
const container = require('../../container');
const authController = container.get('authController');

const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new resident user
 */
router.post(
  '/register',
  authLimiter,           // ← Brute-force protection
  validate(registerSchema),
  asyncHandler(authController.register)
);

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user & get tokens
 */
router.post(
  '/login',
  authLimiter,           // ← Brute-force protection
  validate(loginSchema),
  asyncHandler(authController.login)
);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 */
router.post(
  '/refresh',
  asyncHandler(authController.refreshToken)
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user & clear tokens
 */
router.post(
  '/logout',
  asyncHandler(authController.logout)
);

module.exports = router;

