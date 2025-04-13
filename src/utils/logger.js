const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log' })
  ]
});

// Handle unhandled exceptions and rejections.
logger.exceptions.handle(
  new transports.File({ filename: 'logs/exceptions.log' })
);

process.on('unhandledRejection', (ex) => {
  throw ex;
});

module.exports = logger;
