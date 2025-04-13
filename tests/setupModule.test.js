// tests/setupModule.test.js
const { connect, clearDatabase, closeDatabase } = require("./setup");

describe("Setup Module", () => {
  it("should export connect, clearDatabase, and closeDatabase functions", () => {
    expect(typeof connect).toBe("function");
    expect(typeof clearDatabase).toBe("function");
    expect(typeof closeDatabase).toBe("function");
  });
});
