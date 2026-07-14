const winston = require('winston');
const path = require('path');

/**
 * Custom Winston logger with a dedicated 'audit' level.
 */
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    audit: 2, // security-sensitive actions
    info: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    audit: 'magenta',
    info: 'green',
    debug: 'blue',
  },
};

winston.addColors(customLevels.colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}]: ${message} ${stack || metaString}`;
  })
);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format,
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../../../backend/logs/combined.log') 
    }),
    // Write only errors to error.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../../../backend/logs/error.log'), 
      level: 'error' 
    }),
    // Write audit logs separately for compliance
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../../../backend/logs/audit.log'), 
      level: 'audit' 
    }),
  ],
});

// Print to console in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

module.exports = logger;
