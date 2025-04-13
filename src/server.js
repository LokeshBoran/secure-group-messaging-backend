const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");
const { port } = require("./config/config");
const authRoutes = require("./routes/auth.routes");
const groupRoutes = require("./routes/group.routes");
const messageRoutes = require("./routes/message.routes");
const errorHandler = require("./middlewares/error.middleware");
const logger = require("./utils/logger");

const app = express();

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(logger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/messages", messageRoutes);

// Error Handling Middleware (should come last)
app.use(errorHandler);

// Create the HTTP server and attach Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" } // Adjust the origin as needed
});

// Make io accessible from the app instance
app.set("io", io);

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("New WebSocket connection:", socket.id);
  
  // Client should join group-specific rooms; listen for a "joinGroup" event.
  socket.on("joinGroup", ({ groupId }) => {
    socket.join(groupId);
    console.log(`Socket ${socket.id} joined group room ${groupId}`);
  });
  
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Connect to the database and start the server
connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

module.exports = app; // Export for testing if needed
