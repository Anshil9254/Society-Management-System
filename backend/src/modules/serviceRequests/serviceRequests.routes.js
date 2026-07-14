const express = require('express');
const { createServiceRequestSchema, updateServiceRequestStatusSchema } = require('./serviceRequests.validator');
const { requireAuth, requireRole, auditLog, validate } = require('../../shared/middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { ROLES } = require('../../shared/constants');

const container = require('../../container');
const serviceRequestsController = container.get('serviceRequestsController');

const router = express.Router();

router.use(requireAuth);

/**
 * @route POST /api/v1/service-requests
 * @desc Raise a new service request (Plumber, Electrician, etc.)
 */
router.post(
  '/',
  validate(createServiceRequestSchema),
  asyncHandler(serviceRequestsController.createServiceRequest)
);

/**
 * @route GET /api/v1/service-requests
 * @desc Get service requests (Residents see their own, Admin sees all)
 */
router.get(
  '/',
  asyncHandler(serviceRequestsController.getServiceRequests)
);

/**
 * @route GET /api/v1/service-requests/:id
 * @desc Get a specific service request
 */
router.get(
  '/:id',
  asyncHandler(serviceRequestsController.getServiceRequestById)
);

/**
 * @route PATCH /api/v1/service-requests/:id/status
 * @desc Update the status of a service request
 */
router.patch(
  '/:id/status',
  requireRole(ROLES.ADMIN, ROLES.COMMITTEE),
  validate(updateServiceRequestStatusSchema),
  auditLog('UPDATE_SERVICE_REQUEST', 'ServiceRequest', (req) => req.params.id),
  asyncHandler(serviceRequestsController.updateServiceRequestStatus)
);

module.exports = router;
