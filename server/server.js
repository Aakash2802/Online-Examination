const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const socketOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];
const io = new Server(server, {
  cors: {
    origin: socketOrigins,
    credentials: true
  }
});

// Middleware - Allow all vercel.app and localhost origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Allow all vercel.app domains and localhost
    if (origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// DB connection and auto-seed
connectDB().then(async () => {
  // Auto-seed database if empty (for production deployment)
  const { seedDatabase } = require('./seedData');
  await seedDatabase();
}).catch(err => console.error('DB connection error:', err));

// Register all models before routes
require('./models/User');
require('./models/Question');
require('./models/Exam');
require('./models/Attempt');
require('./models/AuditLog');
require('./models/ProctoringLog');

// Socket.IO
require('./sockets')(io);

// Start auto-reset scheduler
const { startAutoResetScheduler } = require('./services/autoResetService');
startAutoResetScheduler();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/attempts', require('./routes/attemptRoutes'));
app.use('/api/proctoring', require('./routes/proctoringRoutes'));
app.use('/api/seed', require('./routes/seedRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


