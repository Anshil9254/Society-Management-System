/**
 * Maintenance bill statuses.
 * A bill starts as PENDING, moves to PAID or PARTIALLY_PAID when payments
 * are recorded, and becomes OVERDUE if unpaid past the due date.
 */
const BILL_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  PARTIALLY_PAID: 'partially_paid',
  OVERDUE: 'overdue',
});

const BILL_STATUS_VALUES = Object.values(BILL_STATUS);

module.exports = { BILL_STATUS, BILL_STATUS_VALUES };
