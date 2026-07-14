/**
 * User roles — the 3 roles every user in the system has exactly one of.
 * These values must match the `name` column in the `roles` database table.
 */
const ROLES = Object.freeze({
  ADMIN: 'admin',
  COMMITTEE: 'committee_member',
  RESIDENT: 'resident',
});

const ROLE_VALUES = Object.values(ROLES);

module.exports = { ROLES, ROLE_VALUES };
