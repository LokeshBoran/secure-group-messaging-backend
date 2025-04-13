// tests/messageSocketController.test.js
const httpMocks = require("node-mocks-http");
const { sendMessage } = require("../src/controllers/message.controller");
const Message = require("../src/models/Message");
const Group = require("../src/models/Group");
const { encryptMessage, decryptMessage } = require("../src/utils/cryptoUtil");

// Use Jest to mock the encryption utility functions.
jest.mock("../src/utils/cryptoUtil", () => ({
  encryptMessage: jest.fn(),
  decryptMessage: jest.fn()
}));

describe("Message Controller Socket Emission", () => {
  let req, res, next;
  let fakeEmit;
  let fakeIo;

  beforeEach(() => {
    // Create a fake Socket.io instance with a mocked "to" method.
    fakeEmit = jest.fn();
    fakeIo = {
      to: jest.fn(() => ({
        emit: fakeEmit
      }))
    };

    // Create a fake request.
    req = httpMocks.createRequest({
      method: "POST",
      url: "/api/messages/group123",
      params: { groupId: "group123" },
      body: { content: "Test Message" },
      // Simulate an authenticated user.
      user: { _id: "user1", email: "user1@example.com" },
      app: { get: jest.fn(() => fakeIo) }
    });
    res = httpMocks.createResponse();
    next = jest.fn();

    // Stub encryption functions to pass-through.
    encryptMessage.mockReturnValue("encrypted-message");
    decryptMessage.mockReturnValue("Test Message");

    // Stub Message.prototype.save to avoid real DB writes.
    Message.prototype.save = jest.fn().mockResolvedValue();

    // Stub Group.findById to simulate membership check.
    jest.spyOn(Group, "findById").mockResolvedValue({ _id: "group123", members: ["user1"] });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should emit newMessage event after sending a message", async () => {
    await sendMessage(req, res, next);

    // Verify that req.app.get("io") was called.
    expect(req.app.get).toHaveBeenCalledWith("io");
    // Verify that fakeIo.to() is called with the proper group ID.
    expect(fakeIo.to).toHaveBeenCalledWith("group123");
    // Verify that the "newMessage" event was emitted with a payload containing the decrypted content.
    expect(fakeEmit).toHaveBeenCalledWith("newMessage", expect.objectContaining({
      content: "Test Message"
    }));
    // Check that the response has status 201.
    expect(res.statusCode).toBe(201);
    expect(next).not.toHaveBeenCalled();
  });
});
