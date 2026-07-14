const env = require('./env.config');

/**
 * General application configuration.
 * All values come from the validated env config — never from process.env directly.
 */
const appConfig = Object.freeze({
  env: env.NODE_ENV,
  port: env.PORT,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
  corsOrigin: env.CORS_ORIGIN,
});

module.exports = appConfig;
