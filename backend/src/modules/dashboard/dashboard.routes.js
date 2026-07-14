const express = require('express');
const { requireAuth } = require('../../shared/middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');

const container = require('../../container');
const dashboardController = container.get('dashboardController');

const router = express.Router();

router.use(requireAuth);

/**
 * @route GET /api/v1/dashboard
 * @desc Get dashboard statistics (context-aware based on role)
 */
router.get(
  '/',
  asyncHandler(dashboardController.getDashboardStats)
);

module.exports = router;
