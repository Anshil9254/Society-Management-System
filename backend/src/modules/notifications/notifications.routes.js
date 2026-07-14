const express = require('express');
const { requireAuth } = require('../../shared/middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');

const container = require('../../container');
const notificationsController = container.get('notificationsController');

const router = express.Router();

router.use(requireAuth);

/**
 * @route GET /api/v1/notifications
 * @desc Get notifications for the logged in user
 */
router.get(
  '/',
  asyncHandler(notificationsController.getNotifications)
);

/**
 * @route GET /api/v1/notifications/unread-count
 * @desc Get count of unread notifications
 */
router.get(
  '/unread-count',
  asyncHandler(notificationsController.getUnreadCount)
);

/**
 * @route PATCH /api/v1/notifications/:id/read
 * @desc Mark a notification as read
 */
router.patch(
  '/:id/read',
  asyncHandler(notificationsController.markAsRead)
);

/**
 * @route PATCH /api/v1/notifications/read-all
 * @desc Mark all notifications as read
 */
router.patch(
  '/read-all',
  asyncHandler(notificationsController.markAllAsRead)
);

module.exports = router;
