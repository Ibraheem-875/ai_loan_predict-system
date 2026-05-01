const express = require('express');
const router = express.Router();
const { analyzeLoanHandler, updateStatus, getApplications, getAdminStats } = require('../controllers/loanController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');

// POST  /api/analyze-loan  — Run full analysis
router.post('/analyze-loan', analyzeLoanHandler);

// PATCH /api/loan-status/:id — Update application status
router.patch('/loan-status/:id', updateStatus);

// GET /api/applications — Fetch all loan applications
router.get('/applications', getApplications);

// GET /api/admin/stats — Fetch dashboard metrics
router.get('/admin/stats', protectAdmin, getAdminStats);

module.exports = router;
