const request = require("supertest");
const app = require("../src/server");
const mongoose = require("mongoose");
const User = require("../src/models/User");

beforeAll(async () => {
  // Connect to test database if needed or use in-memory database
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe("Auth Endpoints", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "Password123" });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual("User registered successfully.");
  });

  it("should login and return a JWT token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "Password123" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
