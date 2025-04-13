// tests/setupEnv.js
process.env.NODE_ENV = "test";
// Optionally, set any defaults here:
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
