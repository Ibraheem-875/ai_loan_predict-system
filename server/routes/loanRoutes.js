const express = require('express');
const router = express.Router();
const { analyzeLoanHandler, updateStatus, getApplications } = require('../controllers/loanController');

// POST  /api/analyze-loan  — Run full analysis
router.post('/analyze-loan', analyzeLoanHandler);

// PATCH /api/loan-status/:id — Update application status
router.patch('/loan-status/:id', updateStatus);

// GET /api/applications — Fetch all loan applications
router.get('/applications', getApplications);

module.exports = router;
