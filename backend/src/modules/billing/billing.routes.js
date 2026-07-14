const express = require('express');
const { generateBillSchema, generateBulkBillSchema } = require('./billing.validator');
const { requireAuth, requireRole, auditLog, validate } = require('../../shared/middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { Roles } = require('../../shared/constants');

const container = require('../../container');
const billingController = container.get('billingController');

const router = express.Router();

router.use(requireAuth);

/**
 * @route GET /api/v1/billing
 * @desc Get bills (filtered by user if resident, all if admin/committee)
 */
router.get(
  '/',
  asyncHandler(billingController.getBills)
);

/**
 * @route GET /api/v1/billing/:id
 * @desc Get a specific bill
 */
router.get(
  '/:id',
  asyncHandler(billingController.getBillById)
);

// ─── Admin Only Routes ──────────────────────────────────────
router.use(requireRole(Roles.ADMIN));

/**
 * @route POST /api/v1/billing/single
 * @desc Generate a bill for a single flat
 */
router.post(
  '/single',
  validate(generateBillSchema),
  auditLog('GENERATE_BILL', 'MaintenanceBill', () => null),
  asyncHandler(billingController.generateBill)
);

/**
 * @route POST /api/v1/billing/bulk
 * @desc Generate bills for all flats simultaneously
 */
router.post(
  '/bulk',
  validate(generateBulkBillSchema),
  auditLog('GENERATE_BULK_BILLS', 'MaintenanceBill', () => null),
  asyncHandler(billingController.generateBulkBills)
);

module.exports = router;
