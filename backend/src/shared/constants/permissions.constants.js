const { ROLES } = require('./roles.constants');

/**
 * Fine-grained permissions in "resource:action" format.
 * Every protected route checks for a specific permission, not just a role.
 * This makes it easy to add new roles or adjust access without touching route code.
 */
const PERMISSIONS = Object.freeze({
  // ─── Users ─────────────────────────────────────────────
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_READ_OWN: 'users:read_own',
  USERS_UPDATE_OWN: 'users:update_own',

  // ─── Complaints ────────────────────────────────────────
  COMPLAINTS_CREATE: 'complaints:create',
  COMPLAINTS_READ_ALL: 'complaints:read_all',
  COMPLAINTS_READ_OWN: 'complaints:read_own',
  COMPLAINTS_ASSIGN: 'complaints:assign',
  COMPLAINTS_UPDATE_STATUS: 'complaints:update_status',
  COMPLAINTS_DELETE: 'complaints:delete',

  // ─── Maintenance Bills ─────────────────────────────────
  BILLS_CREATE: 'bills:create',
  BILLS_READ_ALL: 'bills:read_all',
  BILLS_READ_OWN: 'bills:read_own',
  BILLS_DELETE: 'bills:delete',

  // ─── Payments ──────────────────────────────────────────
  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_READ_ALL: 'payments:read_all',
  PAYMENTS_READ_OWN: 'payments:read_own',

  // ─── Announcements ────────────────────────────────────
  ANNOUNCEMENTS_CREATE: 'announcements:create',
  ANNOUNCEMENTS_UPDATE: 'announcements:update',
  ANNOUNCEMENTS_DELETE: 'announcements:delete',
  ANNOUNCEMENTS_READ: 'announcements:read',

  // ─── Service Requests ──────────────────────────────────
  SERVICE_REQUESTS_CREATE: 'service_requests:create',
  SERVICE_REQUESTS_READ_ALL: 'service_requests:read_all',
  SERVICE_REQUESTS_READ_OWN: 'service_requests:read_own',
  SERVICE_REQUESTS_UPDATE_STATUS: 'service_requests:update_status',

  // ─── Blocks & Flats ───────────────────────────────────
  BLOCKS_MANAGE: 'blocks:manage',
  FLATS_MANAGE: 'flats:manage',

  // ─── Dashboard ─────────────────────────────────────────
  DASHBOARD_FULL: 'dashboard:full',
  DASHBOARD_LIMITED: 'dashboard:limited',
  DASHBOARD_PERSONAL: 'dashboard:personal',

  // ─── Audit Logs ────────────────────────────────────────
  AUDIT_READ: 'audit:read',
});

/**
 * Maps each role to its list of allowed permissions.
 * Admin gets everything. Committee gets a curated subset.
 * Resident gets only own-data access + create permissions.
 */
const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  [ROLES.COMMITTEE]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_READ_OWN,
    PERMISSIONS.USERS_UPDATE_OWN,
    PERMISSIONS.COMPLAINTS_READ_ALL,
    PERMISSIONS.COMPLAINTS_UPDATE_STATUS,
    PERMISSIONS.COMPLAINTS_ASSIGN,
    PERMISSIONS.BILLS_READ_ALL,
    PERMISSIONS.PAYMENTS_READ_ALL,
    PERMISSIONS.ANNOUNCEMENTS_CREATE,
    PERMISSIONS.ANNOUNCEMENTS_UPDATE,
    PERMISSIONS.ANNOUNCEMENTS_READ,
    PERMISSIONS.SERVICE_REQUESTS_READ_ALL,
    PERMISSIONS.SERVICE_REQUESTS_UPDATE_STATUS,
    PERMISSIONS.DASHBOARD_LIMITED,
  ],

  [ROLES.RESIDENT]: [
    PERMISSIONS.USERS_READ_OWN,
    PERMISSIONS.USERS_UPDATE_OWN,
    PERMISSIONS.COMPLAINTS_CREATE,
    PERMISSIONS.COMPLAINTS_READ_OWN,
    PERMISSIONS.BILLS_READ_OWN,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.PAYMENTS_READ_OWN,
    PERMISSIONS.ANNOUNCEMENTS_READ,
    PERMISSIONS.SERVICE_REQUESTS_CREATE,
    PERMISSIONS.SERVICE_REQUESTS_READ_OWN,
    PERMISSIONS.DASHBOARD_PERSONAL,
  ],
});

module.exports = { PERMISSIONS, ROLE_PERMISSIONS };
