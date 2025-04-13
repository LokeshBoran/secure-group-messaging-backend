// tests/errorMiddleware.test.js
const httpMocks = require("node-mocks-http");
const errorMiddleware = require("../src/middlewares/error.middleware");

describe("Error Middleware", () => {
  it("should return JSON with error message and status", () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const error = new Error("Test error");
    error.status = 400;
    const next = jest.fn();
    
    errorMiddleware(error, req, res, next);
    const data = res._getJSONData();
    expect(res.statusCode).toBe(400);
    expect(data.error).toEqual("Test error");
  });
});
