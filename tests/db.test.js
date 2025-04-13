// tests/db.test.js
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

describe("DB Connection", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should throw an error in test mode when mongoose.connect fails", async () => {
    const fakeError = new Error("Connection failed");
    jest.spyOn(mongoose, "connect").mockRejectedValue(fakeError);
    await expect(connectDB()).rejects.toThrow("Connection failed");
  });
});
