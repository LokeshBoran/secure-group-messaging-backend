// tests/messageAdditional.test.js
const httpMocks = require("node-mocks-http");
const messageController = require("../src/controllers/message.controller");
const Group = require("../src/models/Group");
const { clearDatabase, connect, closeDatabase } = require("./setup");
const mongoose = require("mongoose");

describe("Message Controller Additional Cases", () => {
  beforeAll(async () => {
    await connect();
  });
  
  afterEach(async () => {
    await clearDatabase();
  });
  
  afterAll(async () => {
    await closeDatabase();
  });
  
  describe("getMessages", () => {
    let req, res, next;
    let group;
    
    beforeEach(async () => {
      group = await Group.create({
        name: "Test Group",
        type: "open",
        maxMembers: 10,
        owner: new mongoose.Types.ObjectId(),
        members: [new mongoose.Types.ObjectId()]
      });
      
      req = httpMocks.createRequest({
        params: { groupId: group._id.toString() },
        user: { _id: group.members[0] }
      });
      res = httpMocks.createResponse();
      next = jest.fn();
    });
    
    it("should return 404 if group is not found", async () => {
      req.params.groupId = new mongoose.Types.ObjectId().toString();
      await messageController.getMessages(req, res, next);
      const data = res._getJSONData();
      expect(res.statusCode).toBe(404);
      expect(data.message).toEqual("Group not found.");
    });
  });
});
