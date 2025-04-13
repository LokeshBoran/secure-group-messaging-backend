// tests/groupAdditional.test.js
const httpMocks = require("node-mocks-http");
const groupController = require("../src/controllers/group.controller");
const Group = require("../src/models/Group");
const { clearDatabase, connect, closeDatabase } = require("./setup");
const mongoose = require("mongoose");

describe("Group Controller Additional Cases", () => {
  beforeAll(async () => {
    await connect();
  });
  
  afterEach(async () => {
    await clearDatabase();
  });
  
  afterAll(async () => {
    await closeDatabase();
  });
  
  describe("joinGroup for private groups with cooldown", () => {
    let req, res, next;
    let group;

    beforeEach(async () => {
      // Create a private group with no members yet.
      group = await Group.create({
        name: "Private Group",
        type: "private",
        maxMembers: 10,
        owner: new mongoose.Types.ObjectId(),
        members: []
      });
      
      req = httpMocks.createRequest({
        params: { groupId: group._id.toString() },
        user: { _id: new mongoose.Types.ObjectId() }
      });
      res = httpMocks.createResponse();
      next = jest.fn();
    });
    
    it("should submit a join request if no join request exists and no cooldown", async () => {
      await groupController.joinGroup(req, res, next);
      const data = res._getJSONData();
      expect(data.message).toEqual("Join request submitted. Await approval from the group owner.");
      const updatedGroup = await Group.findById(group._id);
      expect(updatedGroup.joinRequests.length).toBe(1);
      expect(updatedGroup.joinRequests[0].userId.toString()).toEqual(req.user._id.toString());
    });
    
    it("should reject join request if cooldown is active", async () => {
      // Simulate a recent leave (within 48 hours)
      group.privateLeaveLog.push({ userId: req.user._id, leftAt: new Date() });
      await group.save();
      await groupController.joinGroup(req, res, next);
      const data = res._getJSONData();
      expect(data.message).toEqual("You left this group recently. Please wait 48 hours before rejoining.");
    });
    
    it("should allow join request if cooldown expired", async () => {
      // Simulate a leave 49 hours ago.
      const pastDate = new Date(Date.now() - 49 * 3600 * 1000);
      group.privateLeaveLog.push({ userId: req.user._id, leftAt: pastDate });
      await group.save();
      await groupController.joinGroup(req, res, next);
      const data = res._getJSONData();
      expect(data.message).toEqual("Join request submitted. Await approval from the group owner.");
      const updatedGroup = await Group.findById(group._id);
      expect(updatedGroup.privateLeaveLog.find(r => r.userId.toString() === req.user._id.toString())).toBeUndefined();
      expect(updatedGroup.joinRequests.length).toBe(1);
    });
  });
  
  describe("leaveGroup for non-owner", () => {
    let req, res, next;
    let group, userId;
    
    beforeEach(async () => {
      userId = new mongoose.Types.ObjectId();
      group = await Group.create({
        name: "Test Group",
        type: "open",
        maxMembers: 10,
        owner: new mongoose.Types.ObjectId(),
        members: [userId]
      });
      
      req = httpMocks.createRequest({
        params: { groupId: group._id.toString() },
        user: { _id: userId }
      });
      res = httpMocks.createResponse();
      next = jest.fn();
    });
    
    it("should remove the user from members when leaving", async () => {
      await groupController.leaveGroup(req, res, next);
      const data = res._getJSONData();
      expect(data.message).toEqual("Left group successfully.");
      const updatedGroup = await Group.findById(group._id);
      expect(updatedGroup.members.map(m => m.toString())).not.toContain(userId.toString());
    });
  });
  
  describe("transferOwnership", () => {
    let req, res, next;
    let group, ownerId, newOwnerId;
    
    beforeEach(async () => {
      ownerId = new mongoose.Types.ObjectId();
      newOwnerId = new mongoose.Types.ObjectId();
      group = await Group.create({
        name: "Test Group",
        type: "open",
        maxMembers: 10,
        owner: ownerId,
        members: [ownerId, newOwnerId]
      });
      
      req = httpMocks.createRequest({
        params: { groupId: group._id.toString() },
        user: { _id: ownerId },
        body: { newOwnerId: newOwnerId.toString() }
      });
      res = httpMocks.createResponse();
      next = jest.fn();
    });
    
    it("should successfully transfer ownership when new owner is a member", async () => {
      await groupController.transferOwnership(req, res, next);
      const data = res._getJSONData();
      expect(data.message).toEqual("Ownership transferred successfully.");
      const updatedGroup = await Group.findById(group._id);
      expect(updatedGroup.owner.toString()).toEqual(newOwnerId.toString());
    });
    
    it("should return error if the new owner is not a member", async () => {
      req.body.newOwnerId = new mongoose.Types.ObjectId().toString();
      await groupController.transferOwnership(req, res, next);
      const data = res._getJSONData();
      expect(data.message).toEqual("New owner must be a current member of the group.");
    });
  });
  
  describe("deleteGroup", () => {
    let req, res, next;
    let group, ownerId;
    
    beforeEach(async () => {
      ownerId = new mongoose.Types.ObjectId();
      group = await Group.create({
        name: "Deletable Group",
        type: "open",
        maxMembers: 10,
        owner: ownerId,
        members: [ownerId]
      });
      
      req = httpMocks.createRequest({
        params: { groupId: group._id.toString() },
        user: { _id: ownerId }
      });
      res = httpMocks.createResponse();
      next = jest.fn();
    });
    
    it("should delete the group if the owner is the sole member", async () => {
      await groupController.deleteGroup(req, res, next);
      const data = res._getJSONData();
      expect(data.message).toEqual("Group deleted successfully.");
      const deletedGroup = await Group.findById(group._id);
      expect(deletedGroup).toBeNull();
    });
    
    it("should not delete the group if there is more than one member", async () => {
      group.members.push(new mongoose.Types.ObjectId());
      await group.save();
      await groupController.deleteGroup(req, res, next);
      const data = res._getJSONData();
      expect(data.message).toEqual("Group cannot be deleted unless owner is the sole member.");
    });
  });
  
  describe("banishMember", () => {
    let req, res, next;
    let group, ownerId, memberId;
    
    beforeEach(async () => {
      ownerId = new mongoose.Types.ObjectId();
      memberId = new mongoose.Types.ObjectId();
      group = await Group.create({
        name: "Banish Group",
        type: "open",
        maxMembers: 10,
        owner: ownerId,
        members: [ownerId, memberId]
      });
      
      req = httpMocks.createRequest({
        params: { groupId: group._id.toString() },
        user: { _id: ownerId },
        body: { userId: memberId.toString() }
      });
      res = httpMocks.createResponse();
      next = jest.fn();
    });
    
    it("should banish a member by removing them from members and adding to bannedMembers", async () => {
      await groupController.banishMember(req, res, next);
      const data = res._getJSONData();
      expect(data.message).toEqual("User banished from group.");
      const updatedGroup = await Group.findById(group._id);
      expect(updatedGroup.members.map(m => m.toString())).not.toContain(memberId.toString());
      expect(updatedGroup.bannedMembers.map(m => m.toString())).toContain(memberId.toString());
    });
  });
});
