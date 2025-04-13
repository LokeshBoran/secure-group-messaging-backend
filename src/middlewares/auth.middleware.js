const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");

/**
 * Authentication middleware to verify JWT token from request headers.
 * Sets the decoded user information to req.user if the token is valid.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authMiddleware = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.header("Authorization")?.split(" ")[1];
  
  // If token is not provided, deny access
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token and decode the payload
    const decoded = jwt.verify(token, jwtSecret);
    
    // Attach the user information to the request object
    req.user = decoded; // Example: { _id, email, ... }
    
    // Proceed to the next middleware
    next();
  } catch (err) {
    // If token is invalid, respond with an error
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
