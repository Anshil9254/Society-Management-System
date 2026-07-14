/**
 * Payment statuses and modes.
 */
const PAYMENT_STATUS = Object.freeze({
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
});

const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

const PAYMENT_MODE = Object.freeze({
  CASH: 'cash',
  UPI: 'upi',
  CARD: 'card',
  NETBANKING: 'netbanking',
});

const PAYMENT_MODE_VALUES = Object.values(PAYMENT_MODE);

module.exports = {
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
  PAYMENT_MODE,
  PAYMENT_MODE_VALUES,
};
