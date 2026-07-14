const { z } = require('zod');

const generateBillSchema = z.object({
  flatId: z.string().uuid('Invalid Flat ID'),
  billingMonth: z.coerce.number().min(1).max(12),
  billingYear: z.coerce.number().min(2000).max(3000),
  amount: z.coerce.number().positive('Amount must be positive'),
  dueDate: z.string().datetime('Due date must be a valid ISO datetime string'),
});

const generateBulkBillSchema = z.object({
  billingMonth: z.coerce.number().min(1).max(12),
  billingYear: z.coerce.number().min(2000).max(3000),
  dueDate: z.string().datetime('Due date must be a valid ISO datetime string'),
  ratePerSqFt: z.coerce.number().positive('Rate per SqFt must be positive'),
  blockId: z.string().uuid('Invalid Block ID').optional().nullable(),
});

module.exports = {
  generateBillSchema,
  generateBulkBillSchema,
};
