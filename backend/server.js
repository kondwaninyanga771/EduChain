require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.set('trust proxy', 1); // Trust the Fly.io reverse proxy for express-rate-limit
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(require('cookie-parser')());
app.use(require('./src/middleware/rateLimiter').apiLimiter);

// CSRF Protection (applied to /api routes)
const csrfProtection = require('./src/middleware/csrfMiddleware');
app.use('/api', csrfProtection);

// Endpoint to fetch the CSRF token
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const assessmentRoutes = require('./src/routes/assessmentRoutes');
const submissionRoutes = require('./src/routes/submissionRoutes');
const gradeRoutes = require('./src/routes/gradeRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const lecturerRoutes = require('./src/routes/lecturerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const programRoutes = require('./src/routes/programRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/lecturer', lecturerRoutes);
app.use('/api/admin/programs', programRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    // Perform a basic query to ensure database is connected
    const userCount = await prisma.user.count();
    res.json({
      status: 'OK',
      message: 'EduChain Backend API is running.',
      database: 'Connected to SQLite via Prisma',
      usersInDatabase: userCount
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed.',
      error: error.message
    });
  }
});

// Serve Static Frontend (Production)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Catch-all route to serve the React App for any non-API routes
app.use((req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global Error Handler to ensure JSON responses
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({
    status: 'ERROR',
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EduChain Backend Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Connected to SQLite database.`);
});
