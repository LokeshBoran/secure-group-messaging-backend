// Basic request logging middleware
// Logs the timestamp, request method, and request URL
/**
 * @param {import('express').Request} req - The request object
 * @param {import('express').Response} res - The response object
 * @param {import('express').NextFunction} next - The next middleware function
 */
const logger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  };
  
  module.exports = logger;
  