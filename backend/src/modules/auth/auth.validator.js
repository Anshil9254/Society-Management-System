const { z } = require('zod');

/**
 * Zod validation schemas for Auth endpoints.
 * Applied in routes via validate(schema) middleware.
 */

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be a 10-digit number').optional(),
  flatId: z.string().uuid('Invalid Flat ID'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
