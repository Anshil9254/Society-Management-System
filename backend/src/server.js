const http = require('http');
const app = require('./app');
const appConfig = require('./shared/config/app.config');
const prisma = require('./shared/config/database.config');
const logger = require('./shared/utils/logger');
const { registerListeners } = require('./shared/events');

const PORT = appConfig.port;

/**
 * Bootstraps the application.
 * Connects to dependencies (DB, Redis via config) before starting the HTTP server.
 */
const startServer = async () => {
  try {
    // 1. Verify Database Connection
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected successfully via Prisma');

    // 2. Register Event Listeners
    registerListeners();

    // 3. Start HTTP Server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`🚀 Server running in ${appConfig.env} mode on port ${PORT}`);
    });

    // 4. Graceful Shutdown Handling
    const shutdown = async (signal) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed.');
        
        await prisma.$disconnect();
        logger.info('Prisma disconnected.');
        
        // Disconnect Redis if configured
        const redisClient = require('./shared/config/redis.config');
        if (redisClient) {
          redisClient.disconnect();
          logger.info('Redis disconnected.');
        }

        process.exit(0);
      });

      // Force close after 10s if graceful shutdown fails
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Start the server
startServer();
