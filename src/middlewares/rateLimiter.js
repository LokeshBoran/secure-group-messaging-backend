const rateLimit = require('express-rate-limit');

try {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });

  console.log('Rate limiter is set up successfully.');

  module.exports = limiter;
} catch (error) {
  console.error('Failed to initialize rate limiter:', error);
  module.exports = (req, res, next) => next(); // Fallback to a no-op middleware
}
