const express = require('express');
const { createComplaintSchema, updateComplaintStatusSchema } = require('./complaints.validator');
const { requireAuth, requireRole, auditLog, validate } = require('../../shared/middleware');
const upload = require('../../shared/middleware/upload.middleware');
const { validateImageBytes } = require('../../shared/middleware/upload.middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { ROLES } = require('../../shared/constants');

const container = require('../../container');
const complaintsController = container.get('complaintsController');

const router = express.Router();

router.use(requireAuth);

/**
 * @route POST /api/v1/complaints
 * @desc Create a new complaint (with optional image)
 */
router.post(
  '/',
  upload.single('image'),       // Step 1: Save file to disk, check declared MIME
  validateImageBytes,           // Step 2: Verify actual binary content (magic bytes)
  (req, res, next) => {
    // multer parses multipart/form-data — text fields arrive as strings
    next();
  },
  validate(createComplaintSchema),
  asyncHandler(complaintsController.createComplaint)
);

/**
 * @route GET /api/v1/complaints
 * @desc Get complaints (filtered by user if resident, all if admin/committee)
 */
router.get(
  '/',
  asyncHandler(complaintsController.getComplaints)
);

/**
 * @route GET /api/v1/complaints/:id
 * @desc Get a specific complaint
 */
router.get(
  '/:id',
  asyncHandler(complaintsController.getComplaintById)
);

/**
 * @route PATCH /api/v1/complaints/:id/status
 * @desc Update complaint status (Admin / Committee only)
 */
router.patch(
  '/:id/status',
  requireRole(ROLES.ADMIN, ROLES.COMMITTEE),
  validate(updateComplaintStatusSchema),
  auditLog('UPDATE_COMPLAINT_STATUS', 'Complaint', (req) => req.params.id),
  asyncHandler(complaintsController.updateStatus)
);

module.exports = router;
