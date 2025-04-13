const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const { port } = require('./config/config');
const authRoutes = require('./routes/auth.routes');
const groupRoutes = require('./routes/group.routes');
const messageRoutes = require('./routes/message.routes');
const errorMiddleware = require('./middlewares/error.middleware');
const logger = require('./utils/logger');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(rateLimiter);

// Log all requests (optional: you can create a separate request logger middleware)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Swagger docs (enable in non-production or when explicitly set)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  const swaggerSetup = require('./swagger');
  swaggerSetup(app);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware (should be last)
app.use(errorMiddleware);

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });
app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`New WebSocket connection: ${socket.id}`);
  socket.on('joinGroup', ({ groupId }) => {
    socket.join(groupId);
    logger.info(`Socket ${socket.id} joined group room ${groupId}`);
  });
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      server.listen(port, () => {
        logger.info(`Server running on port ${port}`);
      });
    })
    .catch((err) => {
      logger.error('Failed to connect DB', err);
    });
}

module.exports = app;
