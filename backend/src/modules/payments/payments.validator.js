const { z } = require('zod');

const recordPaymentSchema = z.object({
  billId: z.string().uuid('Invalid Bill ID'),
  amount: z.number().positive('Amount must be positive'),
  paymentMode: z.enum(['upi', 'card', 'netbanking', 'cash']),
  transactionId: z.string().min(1, 'Transaction ID is required'),
});

module.exports = {
  recordPaymentSchema,
};
