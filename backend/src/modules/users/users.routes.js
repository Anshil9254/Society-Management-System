const express = require('express');
const { updateProfileSchema, updateRoleSchema, updateStatusSchema } = require('./users.validator');
const { requireAuth, requireRole, auditLog, validate } = require('../../shared/middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { Roles } = require('../../shared/constants');

const container = require('../../container');
const usersController = container.get('usersController');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// ─── Self-Service Routes (Any authenticated user) ───────────
router.get('/me', asyncHandler(usersController.getProfile));

router.patch(
  '/me',
  validate(updateProfileSchema),
  asyncHandler(usersController.updateProfile)
);

// ─── Admin/Committee Only Routes ────────────────────────────
// Require Admin or Committee Member role
router.use(requireRole(Roles.ADMIN, Roles.COMMITTEE));

router.get('/', asyncHandler(usersController.getAllUsers));
router.get('/:id', asyncHandler(usersController.getUserById));

// Only Admin can change roles and statuses, and we log these actions
router.patch(
  '/:id/role',
  requireRole(Roles.ADMIN),
  validate(updateRoleSchema),
  auditLog('UPDATE_USER_ROLE', 'User', (req) => req.params.id),
  asyncHandler(usersController.updateRole)
);

router.patch(
  '/:id/status',
  requireRole(Roles.ADMIN),
  validate(updateStatusSchema),
  auditLog('UPDATE_USER_STATUS', 'User', (req) => req.params.id),
  asyncHandler(usersController.updateStatus)
);

module.exports = router;
