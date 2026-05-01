const { analyzeLoan } = require('../services/loanService');
const { generateLoanInsights } = require('../services/aiService');
const LoanApplication = require('../models/LoanApplication');
const User = require('../models/User');
const mongoose = require('mongoose');

const VALID_LOAN_PURPOSES = ['home', 'car', 'personal', 'education'];
const VALID_DOCUMENT_KEYS = ['aadhaar', 'pan', 'salarySlip'];

const sanitizeDocumentVerification = (documentVerification = {}) => {
  return VALID_DOCUMENT_KEYS.reduce((acc, key) => {
    const doc = documentVerification[key] || {};
    acc[key] = {
      uploaded: Boolean(doc.uploaded),
      fileName: typeof doc.fileName === 'string' ? doc.fileName.slice(0, 180) : '',
      fileType: typeof doc.fileType === 'string' ? doc.fileType.slice(0, 80) : '',
      fileSize: typeof doc.fileSize === 'number' ? doc.fileSize : 0,
      url: typeof doc.url === 'string' ? doc.url.slice(0, 500) : '',
      publicId: typeof doc.publicId === 'string' ? doc.publicId.slice(0, 200) : '',
    };
    return acc;
  }, {});
};

/**
 * POST /api/analyze-loan
 * Accepts applicant data, runs the analysis, persists to DB (if available),
 * and returns the full result payload.
 */
const analyzeLoanHandler = async (req, res) => {
  try {
    const {
      income,
      creditScore,
      existingEMI,
      loanAmount,
      tenure,
      employment,
      loanPurpose = 'personal',
      documentVerification,
    } = req.body;
    const sanitizedDocuments = sanitizeDocumentVerification(documentVerification);

    // --- Basic validation ---
    if (!income || !creditScore || !loanAmount || !tenure || !employment || !loanPurpose) {
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
    if (!VALID_LOAN_PURPOSES.includes(loanPurpose)) {
      return res.status(400).json({ error: 'Invalid loan purpose.' });
    }

    // --- Run analysis ---
    const result = analyzeLoan({
      income,
      creditScore,
      existingEMI: existingEMI || 0,
      loanAmount,
      tenure,
      employment,
      loanPurpose,
      documentVerification: sanitizedDocuments,
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
      loanPurpose,
      documentVerification: sanitizedDocuments,
    });

    // Merge AI insights with standard result
    const finalResult = { ...result, ai: aiInsights };

    // --- Persist to MongoDB (non-blocking, graceful) ---
    let applicationId = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const application = await LoanApplication.create({
          ...finalResult,
          income,
          creditScore,
          existingEMI: existingEMI || 0,
          loanAmount,
          tenure,
          employment,
          loanPurpose,
          documentVerification: sanitizedDocuments,
          status: finalResult.eligible ? 'Approved' : 'Rejected',
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

/**
 * GET /api/applications
 * Fetch all loan applications
 */
const getApplications = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ applications: [] });
    }
    const applications = await LoanApplication.find().sort({ createdAt: -1 });
    return res.json({ applications });
  } catch (error) {
    console.error('Fetch applications error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * GET /api/admin/stats
 * Aggregate user and application metrics for the admin panel.
 */
const getAdminStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        totalUsers: 0,
        totalApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        approvalRatio: 0,
        pendingApplications: 0,
      });
    }

    const [
      totalUsers,
      totalApplications,
      approvedApplications,
      rejectedApplications,
      pendingApplications,
    ] = await Promise.all([
      User.countDocuments(),
      LoanApplication.countDocuments(),
      LoanApplication.countDocuments({ status: 'Approved' }),
      LoanApplication.countDocuments({ status: 'Rejected' }),
      LoanApplication.countDocuments({ status: { $in: ['Applied', 'Under Review'] } }),
    ]);

    const approvalRatio = totalApplications
      ? Math.round((approvedApplications / totalApplications) * 100)
      : 0;

    return res.json({
      totalUsers,
      totalApplications,
      approvedApplications,
      rejectedApplications,
      approvalRatio,
      pendingApplications,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { analyzeLoanHandler, updateStatus, getApplications, getAdminStats };
