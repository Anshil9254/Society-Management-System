const { z } = require('zod');

const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['plumbing', 'electrical', 'security', 'housekeeping', 'other']),
  priority: z.enum(['low', 'medium', 'high']).default('low'),
});

const updateComplaintStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  comment: z.string().min(1, 'A comment is required when updating status'),
});

module.exports = {
  createComplaintSchema,
  updateComplaintStatusSchema,
};
