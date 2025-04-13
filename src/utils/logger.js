const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    // Console transport (for development and production)
    new transports.Console(),
    // File transport (writes logs to a file in production)
    new transports.File({ filename: 'logs/app.log' })
  ]
});

// Handle uncaught exceptions and unhandled promise rejections
logger.exceptions.handle(new transports.File({ filename: 'logs/exceptions.log' }));
process.on('unhandledRejection', (ex) => {
  throw ex;
});

module.exports = logger;
