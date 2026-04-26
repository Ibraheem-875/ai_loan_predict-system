const express = require('express');
const router = express.Router();

const DUMMY_USER = {
  id: 'user_123',
  name: 'Demo User',
  email: 'demo@example.com'
};

const DUMMY_TOKEN = 'mock-jwt-token-12345';

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email } = req.body;
  res.json({
    token: DUMMY_TOKEN,
    user: { id: 'user_123', name: name || DUMMY_USER.name, email: email || DUMMY_USER.email }
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email } = req.body;
  res.json({
    token: DUMMY_TOKEN,
    user: { id: 'user_123', name: DUMMY_USER.name, email: email || DUMMY_USER.email }
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  res.json({ user: DUMMY_USER });
});

module.exports = router;
