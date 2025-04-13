// tests/authMiddleware.test.js
const httpMocks = require("node-mocks-http");
const authMiddleware = require("../src/middlewares/auth.middleware");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../src/config/config");

describe("Auth Middleware", () => {
  it("should return 401 if no token is provided", () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    const data = res._getJSONData();
    expect(data.message).toEqual("Access denied. No token provided.");
  });
  
  it("should return 400 if the token is invalid", () => {
    const req = httpMocks.createRequest({
      headers: { Authorization: "Bearer invalidtoken" }
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(res.statusCode).toBe(400);
    const data = res._getJSONData();
    expect(data.message).toEqual("Invalid token.");
  });
  
  it("should call next() if a valid token is provided", () => {
    const token = jwt.sign({ _id: "testid", email: "test@example.com" }, jwtSecret);
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${token}` }
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
