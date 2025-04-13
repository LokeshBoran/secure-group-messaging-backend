// tests/setupEnv.js
process.env.NODE_ENV = "test";
// Optionally, set any defaults here:
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/secure-group-messaging";

// You can also set other environment variables if needed
process.env.AES_KEY = process.env.AES_KEY || "1234567890abcdef";
process.env.AES_IV = process.env.AES_IV || "abcdef1234567890";
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
