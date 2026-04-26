const { analyzeLoan } = require('../services/loanService');
const { generateLoanInsights } = require('../services/aiService');
const LoanApplication = require('../models/LoanApplication');
const mongoose = require('mongoose');

/**
 * POST /api/analyze-loan
 * Accepts applicant data, runs the analysis, persists to DB (if available),
 * and returns the full result payload.
 */
const analyzeLoanHandler = async (req, res) => {
  try {
    const { income, creditScore, existingEMI, loanAmount, tenure, employment } = req.body;

    // --- Basic validation ---
    if (!income || !creditScore || !loanAmount || !tenure || !employment) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (typeof income !== 'number' || income <= 0) {
      return res.status(400).json({ error: 'Income must be a positive number.' });
    }
    if (typeof creditScore !== 'number' || creditScore < 300 || creditScore > 900) {
      return res.status(400).json({ error: 'Credit score must be between 300 and 900.' });
    }
    if (typeof loanAmount !== 'number' || loanAmount <= 0) {
      return res.status(400).json({ error: 'Loan amount must be a positive number.' });
    }
    if (typeof tenure !== 'number' || tenure <= 0) {
      return res.status(400).json({ error: 'Tenure must be a positive number (months).' });
    }
    if (!['stable', 'unstable'].includes(employment)) {
      return res.status(400).json({ error: 'Employment must be "stable" or "unstable".' });
    }

    // --- Run analysis ---
    const result = analyzeLoan({
      income,
      creditScore,
      existingEMI: existingEMI || 0,
      loanAmount,
      tenure,
      employment,
    });

    // --- Generate AI Insights ---
    // This runs asynchronously, waiting for Gemini response
    const aiInsights = await generateLoanInsights({
      income,
      creditScore,
      existingEMI: existingEMI || 0,
      loanAmount,
      tenure,
      employment,
    });

    // Merge AI insights with standard result
    const finalResult = { ...result, ai: aiInsights };

    // --- Persist to MongoDB (non-blocking, graceful) ---
    let applicationId = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const application = await LoanApplication.create({
          income,
          creditScore,
          existingEMI: existingEMI || 0,
          loanAmount,
          tenure,
          employment,
          ...finalResult,
        });
        applicationId = application._id;
      } catch (dbErr) {
        console.warn('DB save failed:', dbErr.message);
      }
    }

    return res.json({ ...finalResult, applicationId });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * PATCH /api/loan-status/:id
 * Update the application status (Applied → Under Review → Approved/Rejected).
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Applied', 'Under Review', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json({ message: 'Status updated (in-memory mode)', status });
    }

    const app = await LoanApplication.findByIdAndUpdate(id, { status }, { new: true });
    if (!app) return res.status(404).json({ error: 'Application not found.' });

    return res.json({ status: app.status, id: app._id });
  } catch (error) {
    console.error('Status update error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { analyzeLoanHandler, updateStatus };
