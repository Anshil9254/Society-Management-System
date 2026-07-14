/**
 * API-level constants — prefix, pagination defaults, and other shared values.
 */
const API = Object.freeze({
  PREFIX: '/api/v1',
  VERSION: 'v1',
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

/** User account statuses. */
const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
});

const USER_STATUS_VALUES = Object.values(USER_STATUS);

/** Announcement target audiences. */
const TARGET_AUDIENCE = Object.freeze({
  ALL: 'all',
  RESIDENTS: 'residents',
  COMMITTEE: 'committee',
});

const TARGET_AUDIENCE_VALUES = Object.values(TARGET_AUDIENCE);

module.exports = { API, USER_STATUS, USER_STATUS_VALUES, TARGET_AUDIENCE, TARGET_AUDIENCE_VALUES };
