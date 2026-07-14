const express = require('express');
const { createAnnouncementSchema, updateAnnouncementSchema } = require('./announcements.validator');
const { requireAuth, requireRole, auditLog, validate } = require('../../shared/middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { ROLES } = require('../../shared/constants');

const container = require('../../container');
const announcementsController = container.get('announcementsController');

const router = express.Router();

router.use(requireAuth);

/**
 * @route GET /api/v1/announcements
 * @desc Get announcements
 */
router.get(
  '/',
  asyncHandler(announcementsController.getAnnouncements)
);

/**
 * @route GET /api/v1/announcements/:id
 * @desc Get single announcement
 */
router.get(
  '/:id',
  asyncHandler(announcementsController.getAnnouncementById)
);

// ─── Admin/Committee Only Routes ──────────────────────────
router.use(requireRole(ROLES.ADMIN, ROLES.COMMITTEE));

/**
 * @route POST /api/v1/announcements
 * @desc Create an announcement
 */
router.post(
  '/',
  validate(createAnnouncementSchema),
  auditLog('CREATE_ANNOUNCEMENT', 'Announcement', () => null),
  asyncHandler(announcementsController.createAnnouncement)
);

/**
 * @route PATCH /api/v1/announcements/:id
 * @desc Update an announcement
 */
router.patch(
  '/:id',
  validate(updateAnnouncementSchema),
  auditLog('UPDATE_ANNOUNCEMENT', 'Announcement', (req) => req.params.id),
  asyncHandler(announcementsController.updateAnnouncement)
);

/**
 * @route DELETE /api/v1/announcements/:id
 * @desc Delete an announcement
 */
router.delete(
  '/:id',
  auditLog('DELETE_ANNOUNCEMENT', 'Announcement', (req) => req.params.id),
  asyncHandler(announcementsController.deleteAnnouncement)
);

module.exports = router;
