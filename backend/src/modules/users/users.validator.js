const { z } = require('zod');
const { Roles } = require('../../shared/constants');

const updateProfileSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone must be a 10-digit number').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
});

const updateRoleSchema = z.object({
  role: z.enum([Roles.ADMIN, Roles.COMMITTEE, Roles.RESIDENT]),
});

const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
});

module.exports = {
  updateProfileSchema,
  updateRoleSchema,
  updateStatusSchema,
};
