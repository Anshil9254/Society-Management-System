const eventBus = require('./eventBus');
const logger = require('../utils/logger');

/**
 * Registers all event listeners.
 * This is called once at startup in server.js.
 * 
 * As we add modules (Phase 4), we'll require their listeners here
 * (e.g., require('./listeners/notification.listener')(eventBus);)
 */
const registerListeners = () => {
  logger.info('🎧 Registering event listeners...');
  
  // Placeholder for future listeners
  // require('./listeners/audit.listener')(eventBus);
  // require('./listeners/notification.listener')(eventBus);
  
  // Debug listener for development
  if (process.env.NODE_ENV !== 'production') {
    eventBus.on('debug', (data) => {
      logger.debug('Debug event caught:', data);
    });
  }
};

module.exports = {
  eventBus,
  registerListeners,
};
