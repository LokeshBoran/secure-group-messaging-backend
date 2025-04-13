// tests/group.test.js
// require("./setup");
const request = require("supertest");
const app = require("../src/server");
const User = require("../src/models/User");
const Group = require("../src/models/Group");
const { connect, clearDatabase, closeDatabase } = require("./setup");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../src/config/config");

let tokenA, tokenB, userA, userB, groupId;

describe("Group Endpoints", () => {
  beforeAll(async () => {
    await connect();
    // Create two users and generate tokens manually
    userA = await User.create({ email: "userA@example.com", password: "Password123" });
    userB = await User.create({ email: "userB@example.com", password: "Password123" });
    tokenA = jwt.sign({ _id: userA._id, email: userA.email }, jwtSecret, { expiresIn: "1h" });
    tokenB = jwt.sign({ _id: userB._id, email: userB.email }, jwtSecret, { expiresIn: "1h" });
  });

  afterEach(async () => {
    await clearDatabase();
    // Recreate users if needed for next tests
    userA = await User.create({ email: "userA@example.com", password: "Password123" });
    userB = await User.create({ email: "userB@example.com", password: "Password123" });
    tokenA = jwt.sign({ _id: userA._id, email: userA.email }, jwtSecret, { expiresIn: "1h" });
    tokenB = jwt.sign({ _id: userB._id, email: userB.email }, jwtSecret, { expiresIn: "1h" });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it("should allow user A to create a group", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Test Group",
        type: "open",
        maxMembers: 10
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.group).toHaveProperty("_id");
    groupId = res.body.group._id;
  });

  it("should allow user B to join an open group", async () => {
    // Create group with tokenA
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Open Group",
        type: "open",
        maxMembers: 10
      });
    groupId = createRes.body.group._id;

    const joinRes = await request(app)
      .post(`/api/groups/${groupId}/join`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(joinRes.statusCode).toEqual(200);
    expect(joinRes.body.message).toEqual("Joined open group successfully.");
  });

  it("should submit join request for private group", async () => {
    // Create private group with tokenA
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Private Group",
        type: "private",
        maxMembers: 10
      });
    groupId = createRes.body.group._id;

    const joinRes = await request(app)
      .post(`/api/groups/${groupId}/join`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(joinRes.statusCode).toEqual(200);
    expect(joinRes.body.message).toEqual("Join request submitted. Await approval from the group owner.");
  });

  it("should allow group owner to approve join request", async () => {
    // Create private group with tokenA
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Private Group Approve",
        type: "private",
        maxMembers: 10
      });
    groupId = createRes.body.group._id;

    // User B submits join request
    await request(app)
      .post(`/api/groups/${groupId}/join`)
      .set("Authorization", `Bearer ${tokenB}`);

    // User A approves join request of userB
    const approveRes = await request(app)
      .post(`/api/groups/${groupId}/approve`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ userId: userB._id });
    expect(approveRes.statusCode).toEqual(200);
    expect(approveRes.body.message).toEqual("User added to group.");
  });

  it("should allow a non-owner to leave a group", async () => {
    // Create open group with tokenA and let userB join
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Leave Group Test",
        type: "open",
        maxMembers: 10
      });
    groupId = createRes.body.group._id;
    await request(app)
      .post(`/api/groups/${groupId}/join`)
      .set("Authorization", `Bearer ${tokenB}`);
      
    const leaveRes = await request(app)
      .post(`/api/groups/${groupId}/leave`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(leaveRes.statusCode).toEqual(200);
    expect(leaveRes.body.message).toEqual("Left group successfully.");
  });

  it("should allow group owner to banish a member", async () => {
    // Create open group with tokenA and let userB join
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Banish Test",
        type: "open",
        maxMembers: 10
      });
    groupId = createRes.body.group._id;
    await request(app)
      .post(`/api/groups/${groupId}/join`)
      .set("Authorization", `Bearer ${tokenB}`);

    // Owner bans userB
    const banishRes = await request(app)
      .post(`/api/groups/${groupId}/banish`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ userId: userB._id });
    expect(banishRes.statusCode).toEqual(200);
    expect(banishRes.body.message).toEqual("User banished from group.");
  });

  it("should allow group owner to transfer ownership", async () => {
    // Create open group with tokenA
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Transfer Test",
        type: "open",
        maxMembers: 10
      });
    groupId = createRes.body.group._id;
    
    // Simulate userB joining
    await request(app)
      .post(`/api/groups/${groupId}/join`)
      .set("Authorization", `Bearer ${tokenB}`);

    // Owner transfers ownership to userB
    const transferRes = await request(app)
      .post(`/api/groups/${groupId}/transfer`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ newOwnerId: userB._id });
    expect(transferRes.statusCode).toEqual(200);
    expect(transferRes.body.message).toEqual("Ownership transferred successfully.");
  });

  it("should allow group owner to delete group if sole member", async () => {
    // Create a group with tokenA; no other members
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Delete Group Test",
        type: "open",
        maxMembers: 10
      });
    groupId = createRes.body.group._id;

    const deleteRes = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(deleteRes.statusCode).toEqual(200);
    expect(deleteRes.body.message).toEqual("Group deleted successfully.");
  });

  it("should not allow group owner to leave without transferring ownership", async () => {
    // Create a group with tokenA
    const createRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Owner Leave Test",
        type: "open",
        maxMembers: 10
      });
    groupId = createRes.body.group._id;

    // Owner attempts to leave the group
    const leaveRes = await request(app)
      .post(`/api/groups/${groupId}/leave`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(leaveRes.statusCode).toEqual(400);
    expect(leaveRes.body.message).toEqual("Owner must transfer ownership before leaving the group.");
  });
});
