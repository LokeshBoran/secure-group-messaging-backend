// tests/auth.test.js
// require("./setup");
const request = require("supertest");
const app = require("../src/server"); // Ensure that your server file exports the Express app
const User = require("../src/models/User");
const { connect, clearDatabase, closeDatabase } = require("./setup");

describe("Auth Endpoints", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "Password123"
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual("User registered successfully.");

    // Ensure that the user is in the DB
    const user = await User.findOne({ email: "test@example.com" });
    expect(user).not.toBeNull();
  });

  it("should return 409 for duplicate registration", async () => {
    await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "Password123"
    });
    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "Password123"
    });
    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toEqual("Email already in use.");
  });

  it("should login a registered user", async () => {
    // First, register the user
    await request(app).post("/api/auth/register").send({
      email: "login@example.com",
      password: "Password123"
    });
    // Then, login
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "Password123"
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should not login with invalid credentials", async () => {
    // Register a user
    await request(app).post("/api/auth/register").send({
      email: "loginfail@example.com",
      password: "Password123"
    });
    // Try with wrong password
    const res = await request(app).post("/api/auth/login").send({
      email: "loginfail@example.com",
      password: "WrongPassword"
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Invalid credentials.");
  });
});
