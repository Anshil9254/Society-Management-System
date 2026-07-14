const express = require('express');
const { requireAuth, requireRole, auditLog } = require('../../shared/middleware');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { ROLES } = require('../../shared/constants');

const container = require('../../container');
const blocksController = container.get('blocksController');

const router = express.Router();

// Require Authentication for all routes
router.use(requireAuth);

/**
 * @route GET /api/v1/blocks/my-flat
 * @desc Get current user's flat details
 */
router.get('/my-flat', asyncHandler(blocksController.getMyFlat));

/**
 * @route GET /api/v1/blocks
 * @desc Get all blocks/wings, including flats and family details (Admin only)
 */
router.get('/', requireRole(ROLES.ADMIN), asyncHandler(blocksController.getBlocks));

// ─── Admin Only Routes ──────────────────────────────────────
router.use(requireRole(ROLES.ADMIN));

/**
 * @route POST /api/v1/blocks
 * @desc Create a new Block/Wing
 */
router.post(
  '/',
  auditLog('CREATE_BLOCK', 'Block', (req) => null),
  asyncHandler(blocksController.createBlock)
);

/**
 * @route PUT /api/v1/blocks/:id
 * @desc Update a Block/Wing
 */
router.put(
  '/:id',
  auditLog('UPDATE_BLOCK', 'Block', (req) => req.params.id),
  asyncHandler(blocksController.updateBlock)
);

/**
 * @route DELETE /api/v1/blocks/:id
 * @desc Delete a Block/Wing
 */
router.delete(
  '/:id',
  auditLog('DELETE_BLOCK', 'Block', (req) => req.params.id),
  asyncHandler(blocksController.deleteBlock)
);

/**
 * @route POST /api/v1/blocks/:blockId/flats
 * @desc Add a Flat inside a Block
 */
router.post(
  '/:blockId/flats',
  auditLog('CREATE_FLAT', 'Flat', (req) => req.params.blockId),
  asyncHandler(blocksController.createFlat)
);

/**
 * @route POST /api/v1/blocks/flats/:flatId/family
 * @desc Add a Family Member to a Flat
 */
router.post(
  '/flats/:flatId/family',
  auditLog('ADD_FAMILY_MEMBER', 'FamilyMember', (req) => req.params.flatId),
  asyncHandler(blocksController.addFamilyMember)
);

/**
 * @route DELETE /api/v1/blocks/family/:id
 * @desc Delete a Family Member from a Flat
 */
router.delete(
  '/family/:id',
  auditLog('DELETE_FAMILY_MEMBER', 'FamilyMember', (req) => req.params.id),
  asyncHandler(blocksController.deleteFamilyMember)
);

/**
 * @route POST /api/v1/blocks/flats/:flatId/resident
 * @desc Assign a Primary Resident / Leader to a Flat
 */
router.post(
  '/flats/:flatId/resident',
  auditLog('ASSIGN_PRIMARY_RESIDENT', 'ResidentProfile', (req) => req.params.flatId),
  asyncHandler(blocksController.assignResident)
);

/**
 * @route DELETE /api/v1/blocks/flats/:flatId/resident/:residentId
 * @desc Remove a Primary Resident / Leader from a Flat
 */
router.delete(
  '/flats/:flatId/resident/:residentId',
  auditLog('REMOVE_PRIMARY_RESIDENT', 'ResidentProfile', (req) => req.params.residentId),
  asyncHandler(blocksController.deleteResident)
);

module.exports = router;
