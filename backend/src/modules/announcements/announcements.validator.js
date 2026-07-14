const { z } = require('zod');

const createAnnouncementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  targetAudience: z.enum(['all', 'residents', 'committee']).optional(),
  isPinned: z.boolean().optional(),
});

const updateAnnouncementSchema = z.object({
  title: z.string().min(5).optional(),
  content: z.string().min(10).optional(),
  targetAudience: z.enum(['all', 'residents', 'committee']).optional(),
  isPinned: z.boolean().optional(),
});

module.exports = {
  createAnnouncementSchema,
  updateAnnouncementSchema,
};
