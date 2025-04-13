/**
 * Centralized error handling middleware
 * @param {Object} err - The error object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error("Error:", err.message);

  // Send a JSON response with the error details
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
};
  
  module.exports = errorHandler;
  