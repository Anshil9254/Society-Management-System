const express = require('express');
const { requireAuth, requireRole } = require('../../shared/middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { Roles } = require('../../shared/constants');

const container = require('../../container');
const auditLogsController = container.get('auditLogsController');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(Roles.ADMIN, Roles.COMMITTEE));

/**
 * @route GET /api/v1/audit-logs
 * @desc Get audit logs (Admin/Committee only)
 */
router.get(
  '/',
  asyncHandler(auditLogsController.getAuditLogs)
);

module.exports = router;
