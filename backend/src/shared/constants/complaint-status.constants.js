/**
 * Complaint statuses — tracks the lifecycle of a resident complaint.
 * OPEN → IN_PROGRESS → RESOLVED → CLOSED
 */
const COMPLAINT_STATUS = Object.freeze({
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
});

const COMPLAINT_STATUS_VALUES = Object.values(COMPLAINT_STATUS);

/**
 * Complaint categories — the type of issue a resident is reporting.
 */
const COMPLAINT_CATEGORY = Object.freeze({
  PLUMBING: 'plumbing',
  ELECTRICAL: 'electrical',
  SECURITY: 'security',
  CLEANLINESS: 'cleanliness',
  OTHER: 'other',
});

const COMPLAINT_CATEGORY_VALUES = Object.values(COMPLAINT_CATEGORY);

/**
 * Complaint priority levels.
 */
const COMPLAINT_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
});

const COMPLAINT_PRIORITY_VALUES = Object.values(COMPLAINT_PRIORITY);

module.exports = {
  COMPLAINT_STATUS,
  COMPLAINT_STATUS_VALUES,
  COMPLAINT_CATEGORY,
  COMPLAINT_CATEGORY_VALUES,
  COMPLAINT_PRIORITY,
  COMPLAINT_PRIORITY_VALUES,
};
