// tests/messageSocketController.test.js
const httpMocks = require("node-mocks-http");
const { sendMessage } = require("../src/controllers/message.controller");
const Message = require("../src/models/Message");
const { encryptMessage, decryptMessage } = require("../src/utils/cryptoUtil");

// We'll use Jest to mock the encryption utility functions.
jest.mock("../src/utils/cryptoUtil", () => ({
  encryptMessage: jest.fn(),
  decryptMessage: jest.fn()
}));

describe("Message Controller Socket Emission", () => {
  let req, res, next;
  let fakeEmit;
  let fakeIo;

  beforeEach(() => {
    // Create a fake Socket.io instance with a mocked "to" method
    fakeEmit = jest.fn();
    fakeIo = {
      to: jest.fn(() => ({
        emit: fakeEmit
      }))
    };

    // Create a fake request (using node-mocks-http)
    req = httpMocks.createRequest({
      method: "POST",
      url: "/api/messages/group123",
      params: { groupId: "group123" },
      body: { content: "Test Message" },
      // Attach the fake io instance via req.app.get("io")
      app: {
        get: jest.fn(() => fakeIo)
      }
    });
    res = httpMocks.createResponse();
    next = jest.fn();

    // For testing purposes, have the encryption functions just pass through:
    encryptMessage.mockReturnValue("encrypted-message");
    decryptMessage.mockReturnValue("Test Message");

    // Also, stub out Message.prototype.save so it does not attempt actual DB writes.
    Message.prototype.save = jest.fn().mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should emit newMessage event after sending a message", async () => {
    // Call the sendMessage controller
    await sendMessage(req, res, next);

    // Check that the request's app.get("io") was called and our fakeIo.to was called with the right group ID.
    expect(req.app.get).toHaveBeenCalledWith("io");
    expect(fakeIo.to).toHaveBeenCalledWith("group123");

    // Then verify that the emit function was called with the "newMessage" event and a payload containing the decrypted content.
    expect(fakeEmit).toHaveBeenCalledWith("newMessage", expect.objectContaining({
      content: "Test Message"
    }));

    // Ensure that the response was sent (for example, checking status code)
    expect(res.statusCode).toBe(201);
    // (Optional) Check that no error was passed to next().
    expect(next).not.toHaveBeenCalled();
  });
});
