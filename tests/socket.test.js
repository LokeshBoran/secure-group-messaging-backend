jest.setTimeout(15000);

const ioClient = require("socket.io-client");
const request = require("supertest");
const http = require("http");
const app = require("../src/server");
const { connect, clearDatabase, closeDatabase } = require("./setup");
const User = require("../src/models/User");
const Group = require("../src/models/Group");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../src/config/config");

let token, user, group, socket, serverInstance;

describe("Socket.io Real-Time Messaging", () => {
  beforeAll(async () => {
    await connect();
    // Create a test user and generate token.
    user = await User.create({
      email: "socketuser@example.com",
      password: "Password123"
    });
    token = jwt.sign({ _id: user._id, email: user.email }, jwtSecret, {
      expiresIn: "1h"
    });
    // Create a group and add the user as a member.
    group = await Group.create({
      name: "Socket Group",
      type: "open",
      maxMembers: 10,
      owner: user._id,
      members: [user._id]
    });
    
    // Manually start the server instance on port 3033.
    serverInstance = http.createServer(app);
    const socketIo = require("socket.io");
    const io = socketIo(serverInstance, {
      cors: { origin: "*" }
    });
    // Make the Socket.io instance available to your app.
    app.set("io", io);
    await new Promise((resolve) => serverInstance.listen(3033, resolve));
  });

  afterAll(async () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
    await new Promise((resolve) => serverInstance.close(resolve));
    await closeDatabase();
  });

  it.skip("should receive a new message event via socket", (done) => {
    // Connect to the manually started server instance.
    socket = ioClient("http://localhost:3033", {
      transports: ["websocket"],
      forceNew: true
    });

    socket.on("connect", () => {
      // Convert group._id to string so the room matches when emitting.
      socket.emit("joinGroup", { groupId: group._id.toString() });

      socket.on("newMessage", (message) => {
        try {
          expect(message).toHaveProperty("content", "Real-time message test");
          done();
        } catch (error) {
          done(error);
        }
      });

      // Send a message via API; note the conversion to string in the URL.
      request(app)
        .post(`/api/messages/${group._id.toString()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Real-time message test" })
        .end((err) => {
          if (err) return done(err);
        });
    });
  });
});
