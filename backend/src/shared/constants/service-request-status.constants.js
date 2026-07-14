/**
 * Service request statuses and types.
 */
const SERVICE_REQUEST_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
});

const SERVICE_REQUEST_STATUS_VALUES = Object.values(SERVICE_REQUEST_STATUS);

const SERVICE_TYPE = Object.freeze({
  PLUMBER: 'plumber',
  ELECTRICIAN: 'electrician',
  CLEANING: 'cleaning',
  PEST_CONTROL: 'pest_control',
  OTHER: 'other',
});

const SERVICE_TYPE_VALUES = Object.values(SERVICE_TYPE);

module.exports = {
  SERVICE_REQUEST_STATUS,
  SERVICE_REQUEST_STATUS_VALUES,
  SERVICE_TYPE,
  SERVICE_TYPE_VALUES,
};
