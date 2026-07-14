const { z } = require('zod');

const generateBillSchema = z.object({
  flatId: z.string().uuid('Invalid Flat ID'),
  billingMonth: z.number().min(1).max(12),
  billingYear: z.number().min(2000).max(3000),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().datetime('Due date must be a valid ISO datetime string'),
});

const generateBulkBillSchema = z.object({
  billingMonth: z.number().min(1).max(12),
  billingYear: z.number().min(2000).max(3000),
  dueDate: z.string().datetime('Due date must be a valid ISO datetime string'),
  rates: z.record(z.number().positive()), // e.g. { "2BHK": 2000, "3BHK": 3000 }
});

module.exports = {
  generateBillSchema,
  generateBulkBillSchema,
};
