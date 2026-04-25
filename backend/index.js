require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*', // To be restricted in production
    methods: ['GET', 'POST', 'PUT']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

// HTTP Request Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting (Prevent spam check-ins, max 5 req/min)
const checkinLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many requests from this IP, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/mobile/checkin', checkinLimiter);
app.use('/api/v1/visits/request', checkinLimiter);

// Ping endpoint for Uptime monitors (Render Keep-Alive)
app.get('/api/v1/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is awake' });
});

// Socket.io Namespace & Channels
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  // Client can join specific channels
  socket.on('join_channel', (channelData) => {
    // channelData can be { role: 'Admin' }, { role: 'Employee', id: 'emp123' }, etc.
    if (channelData.role === 'Admin') {
      socket.join('admin_channel');
      logger.info(`Socket ${socket.id} joined admin_channel`);
    } else if (channelData.role === 'Employee' && channelData.id) {
      socket.join(`employee_${channelData.id}`);
      logger.info(`Socket ${socket.id} joined employee_${channelData.id}`);
    } else if (channelData.role === 'Security') {
      socket.join('security_channel');
      logger.info(`Socket ${socket.id} joined security_channel`);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Pass io instance to req for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/visits', require('./routes/visitRoutes'));
app.use('/api/v1/mobile', require('./routes/mobileRoutes'));
app.use('/api/v1/departments', require('./routes/departmentRoutes'));
app.use('/api/v1/designations', require('./routes/designationRoutes'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
