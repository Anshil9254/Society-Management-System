const { z } = require('zod');

const createServiceRequestSchema = z.object({
  serviceType: z.enum(['plumber', 'electrician', 'carpenter', 'cleaning', 'other']),
  preferredDate: z.string().datetime('Preferred date must be a valid ISO datetime string'),
  notes: z.string().max(500).optional(),
});

const updateServiceRequestStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'completed']),
});

module.exports = {
  createServiceRequestSchema,
  updateServiceRequestStatusSchema,
};
