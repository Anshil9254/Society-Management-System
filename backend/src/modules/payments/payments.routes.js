const express = require('express');
const { recordPaymentSchema } = require('./payments.validator');
const { requireAuth, validate } = require('../../shared/middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');

const container = require('../../container');
const paymentsController = container.get('paymentsController');

const router = express.Router();

router.use(requireAuth);

/**
 * @route POST /api/v1/payments
 * @desc Record a payment for a maintenance bill
 * Note: Residents and Admins can record payments (e.g. paying via app vs admin recording offline payment)
 */
router.post(
  '/',
  validate(recordPaymentSchema),
  asyncHandler(paymentsController.recordPayment)
);

/**
 * @route GET /api/v1/payments
 * @desc View payment history
 */
router.get(
  '/',
  asyncHandler(paymentsController.getPayments)
);

module.exports = router;
