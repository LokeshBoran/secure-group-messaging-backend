require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3033,
  // If process.env.MONGODB_URI is not set, default to a local URI.
  mongoURI: process.env.MONGODB_URI || "mongodb://localhost:27017/secure-group-messaging",
  // If process.env.JWT_SECRET is not set, provide a default secret (for testing/development).
  jwtSecret: process.env.JWT_SECRET || "testsecret",
  // AES-128 key and IV defaults (16 characters each) – adjust as needed.
  aesKey: process.env.AES_KEY || "1234567890abcdef",
  aesIv: process.env.AES_IV || "abcdef1234567890"
};
