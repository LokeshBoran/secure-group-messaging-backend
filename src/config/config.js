require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3033,
  // If process.env.MONGODB_URI is not set, default to a local URI.
  mongoURI: process.env.MONGODB_URI,
  // If process.env.JWT_SECRET is not set, provide a default secret (for testing/development).
  jwtSecret: process.env.JWT_SECRET,
  // AES-128 key and IV defaults (16 characters each) – adjust as needed.
  aesKey: process.env.AES_KEY,
  aesIv: process.env.AES_IV
};
