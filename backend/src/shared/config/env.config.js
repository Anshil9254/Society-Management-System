require('dotenv').config();
const { z } = require('zod');

/**
 * Validates ALL environment variables at startup using Zod.
 * If any required variable is missing or malformed, the app crashes immediately
 * with a clear error — it never silently runs with undefined config values.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Database — required, must be a valid connection string
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis — optional in development (features degrade gracefully without it)
  REDIS_URL: z.string().optional(),

  // JWT — both secrets required, minimum 32 chars for security
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // CORS — defaults to Vite dev server
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // File uploads — defaults to 5MB
  UPLOAD_MAX_SIZE: z.coerce.number().default(5242880),
});

let env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error(error.errors.map((e) => `   - ${e.path.join('.')}: ${e.message}`).join('\n'));
  process.exit(1);
}

module.exports = Object.freeze(env);
