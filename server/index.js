require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const loanRoutes = require('./routes/loanRoutes');
const authRoutes = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const healthRoutes = require('./routes/healthRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://ai-loan-predict-system.vercel.app',
  'https://ai-loan-predict-system.onrender.com',
].filter(Boolean);
const localhostOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || localhostOriginPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

// --- Middleware ---
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Request timeout middleware (40 seconds for API responses)
app.use((req, res, next) => {
  req.setTimeout(40000);
  res.setTimeout(40000);
  next();
});

// --- Routes ---
app.get('/', (_req, res) => res.json({ status: 'ok', message: 'AI Loan Predict API is running' }));
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api', uploadRoutes);
app.use('/api', loanRoutes);

// --- 404 handler ---
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- Start server ---
const start = async () => {
  // Connect to DB in the background
  connectDB().catch(err => console.error('Background DB connection failed:', err));
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();
