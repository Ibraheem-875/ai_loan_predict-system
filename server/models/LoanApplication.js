const mongoose = require('mongoose');

/**
 * Mongoose schema for a loan application.
 * Stores all input parameters and the computed analysis results.
 */
const loanApplicationSchema = new mongoose.Schema(
  {
    // --- Input fields ---
    income: { type: Number, required: true },
    creditScore: { type: Number, required: true },
    existingEMI: { type: Number, required: true },
    loanAmount: { type: Number, required: true },
    tenure: { type: Number, required: true }, // months
    employment: { type: String, enum: ['stable', 'unstable'], required: true },
    loanPurpose: {
      type: String,
      enum: ['home', 'car', 'personal', 'education'],
      default: 'personal',
    },
    documentVerification: {
      aadhaar: {
        uploaded: { type: Boolean, default: false },
        fileName: String,
        fileType: String,
        fileSize: Number,
      },
      pan: {
        uploaded: { type: Boolean, default: false },
        fileName: String,
        fileType: String,
        fileSize: Number,
      },
      salarySlip: {
        uploaded: { type: Boolean, default: false },
        fileName: String,
        fileType: String,
        fileSize: Number,
      },
    },

    // --- Computed result fields ---
    eligible: { type: Boolean },
    score: { type: Number },
    probability: { type: Number },
    risk: { type: String, enum: ['Low', 'Medium', 'High'] },
    emi: { type: Number },
    recommendedLoan: { type: Number },
    totalPayable: { type: Number },
    interestRate: { type: Number },
    documentStatus: {
      uploadedCount: Number,
      requiredCount: Number,
      complete: Boolean,
    },
    purposeAnalysis: {
      type: String,
      minimumCreditScore: Number,
      maxTenure: Number,
      maxEmiRatio: Number,
      note: String,
      purposeEligible: Boolean,
    },
    reasons: [String],
    suggestions: [String],
    
    // --- AI Generated Insights ---
    ai: {
      summary: String,
      explanation: String,
      riskAnalysis: String,
      suggestions: [String]
    },

    // --- Status tracking ---
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Approved', 'Rejected'],
      default: 'Applied',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
