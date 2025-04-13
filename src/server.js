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

// Error handling middleware (last)
app.use(errorHandler);

// Create the HTTP server and attach Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" } // adjust for production if needed
});

app.set("io", io);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New WebSocket connection:", socket.id);

  socket.on("joinGroup", ({ groupId }) => {
    socket.join(groupId);
    console.log(`Socket ${socket.id} joined group room ${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Only connect and start server if not in test mode
if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      server.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect DB", err);
    });
}

// Export the app for testing
module.exports = app;
