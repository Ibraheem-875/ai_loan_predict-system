require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const loanRoutes = require('./routes/loanRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://ai-loan-predict-system.vercel.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);
app.use(express.json());

// --- Routes ---
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api', loanRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Start server ---
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();
