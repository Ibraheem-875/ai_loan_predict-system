const express = require('express');
const router = express.Router();
const { analyzeLoanHandler, updateStatus } = require('../controllers/loanController');

// POST  /api/analyze-loan  — Run full analysis
router.post('/analyze-loan', analyzeLoanHandler);

// PATCH /api/loan-status/:id — Update application status
router.patch('/loan-status/:id', updateStatus);

module.exports = router;
