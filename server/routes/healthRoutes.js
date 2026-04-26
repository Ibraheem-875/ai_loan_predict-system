const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint - returns server status and database connection status
 */
router.get('/', (_req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    server: {
      port: process.env.PORT || 5000,
      node_version: process.version,
    },
    database: {
      connected: mongoose.connection.readyState === 1,
      state: getConnectionState(mongoose.connection.readyState),
    },
  };

  res.status(200).json(healthStatus);
});

/**
 * GET /api/health/detailed
 * Detailed health check with all system information
 */
router.get('/detailed', (_req, res) => {
  const detailedStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: {
        total: Math.round(require('os').totalmem() / 1024 / 1024),
        free: Math.round(require('os').freemem() / 1024 / 1024),
        used: Math.round((require('os').totalmem() - require('os').freemem()) / 1024 / 1024),
      },
      cpus: require('os').cpus().length,
      platform: process.platform,
    },
    node: {
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
    },
    server: {
      port: process.env.PORT || 5000,
      frontend_url: process.env.FRONTEND_URL || 'not set',
    },
    database: {
      connected: mongoose.connection.readyState === 1,
      state: getConnectionState(mongoose.connection.readyState),
      host: mongoose.connection.host || 'not connected',
      name: mongoose.connection.name || 'not connected',
    },
    services: {
      ai_api_configured: !!process.env.GEMINI_API_KEY,
      jwt_secret_configured: !!process.env.JWT_SECRET,
      mongodb_uri_configured: !!process.env.MONGODB_URI,
    },
  };

  res.status(200).json(detailedStatus);
});

/**
 * GET /api/health/db
 * Database-only health check
 */
router.get('/db', (_req, res) => {
  const dbStatus = {
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    state: getConnectionState(mongoose.connection.readyState),
    host: mongoose.connection.host || 'N/A',
    name: mongoose.connection.name || 'N/A',
    timestamp: new Date().toISOString(),
  };

  const statusCode = mongoose.connection.readyState === 1 ? 200 : 503;
  res.status(statusCode).json(dbStatus);
});

/**
 * Helper function to convert Mongoose connection state to human-readable format
 */
function getConnectionState(state) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[state] || 'unknown';
}

module.exports = router;
