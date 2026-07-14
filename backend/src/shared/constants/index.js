/**
 * Central re-export for all constants.
 * Import from here:  const { ROLES, BILL_STATUS, PERMISSIONS } = require('../shared/constants');
 */
module.exports = {
  ...require('./roles.constants'),
  ...require('./permissions.constants'),
  ...require('./bill-status.constants'),
  ...require('./complaint-status.constants'),
  ...require('./payment-status.constants'),
  ...require('./service-request-status.constants'),
  ...require('./api.constants'),
};
