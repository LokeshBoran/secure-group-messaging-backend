// tests/message.test.js
// require("./setup");
const request = require("supertest");
const app = require("../src/server");
const User = require("../src/models/User");
const Group = require("../src/models/Group");
const Message = require("../src/models/Message");
const { connect, clearDatabase, closeDatabase } = require("./setup");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../src/config/config");

let token, user, group;

describe("Message Endpoints", () => {
  beforeAll(async () => {
    await connect();
    // Create a user and generate token
    user = await User.create({ email: "msguser@example.com", password: "Password123" });
    token = jwt.sign({ _id: user._id, email: user.email }, jwtSecret, { expiresIn: "1h" });
    // Create a group and add the user as a member
    group = await Group.create({
      name: "Messaging Group",
      type: "open",
      maxMembers: 10,
      owner: user._id,
      members: [user._id]
    });
  });

  afterEach(async () => {
    await clearDatabase();
    // Recreate user and group for subsequent tests
    user = await User.create({ email: "msguser@example.com", password: "Password123" });
    token = jwt.sign({ _id: user._id, email: user.email }, jwtSecret, { expiresIn: "1h" });
    group = await Group.create({
      name: "Messaging Group",
      type: "open",
      maxMembers: 10,
      owner: user._id,
      members: [user._id]
    });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it("should send a message to a group", async () => {
    const res = await request(app)
      .post(`/api/messages/${group._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Hello group!" });
    expect(res.statusCode).toEqual(201);
    expect(res.body.messageData).toHaveProperty("content", "Hello group!");
    // Check that the message is stored (encrypted in DB but decrypted in response)
    const msg = await Message.findOne({ groupId: group._id });
    expect(msg).not.toBeNull();
  });

  it("should fetch messages for a group", async () => {
    // Send a message first
    await request(app)
      .post(`/api/messages/${group._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Message 1" });
    await request(app)
      .post(`/api/messages/${group._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Message 2" });

    const res = await request(app)
      .get(`/api/messages/${group._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.messages.length).toEqual(2);
    expect(res.body.messages[0]).toHaveProperty("content");
  });

  it("should prevent non-members from fetching messages", async () => {
    // Create a new user that is not a member
    const nonMember = await User.create({ email: "nonmember@example.com", password: "Password123" });
    const nonMemberToken = jwt.sign({ _id: nonMember._id, email: nonMember.email }, jwtSecret, { expiresIn: "1h" });
    const res = await request(app)
      .get(`/api/messages/${group._id}`)
      .set("Authorization", `Bearer ${nonMemberToken}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toEqual("You are not authorized to view these messages.");
  });
});
