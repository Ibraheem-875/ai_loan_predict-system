/**
 * Core loan analysis service.
 * Contains the scoring logic, EMI calculation, risk assessment,
 * and recommendation engine.
 */

/**
 * Calculate EMI using the standard formula:
 * EMI = (P × r × (1+r)^n) / ((1+r)^n - 1)
 *
 * @param {number} principal  - Loan amount (P)
 * @param {number} annualRate - Annual interest rate in % (e.g. 10)
 * @param {number} tenureMonths - Tenure in months (n)
 * @returns {number} Monthly EMI rounded to 2 decimals
 */
const calculateEMI = (principal, annualRate, tenureMonths) => {
  const r = annualRate / 12 / 100; // monthly interest rate
  if (r === 0) return +(principal / tenureMonths).toFixed(2);

  const onePlusR = Math.pow(1 + r, tenureMonths);
  const emi = (principal * r * onePlusR) / (onePlusR - 1);
  return +emi.toFixed(2);
};

/**
 * Compute the eligibility score (0-100) from the applicant data.
 *
 * Scoring breakdown:
 *   income > 30,000        → +30
 *   creditScore > 700      → +30
 *   existingEMI < 40% inc  → +20
 *   employment === stable   → +20
 */
const LOAN_PURPOSE_CONFIG = {
  home: {
    label: 'Home Loan',
    interestRate: 8.5,
    minimumCreditScore: 700,
    maxTenure: 360,
    maxEmiRatio: 0.45,
    scoreAdjustment: 5,
    note: 'Long tenure secured loan with stronger tolerance for larger amounts.',
  },
  car: {
    label: 'Car Loan',
    interestRate: 9.25,
    minimumCreditScore: 680,
    maxTenure: 84,
    maxEmiRatio: 0.4,
    scoreAdjustment: 2,
    note: 'Medium tenure asset-backed loan where EMI pressure is important.',
  },
  personal: {
    label: 'Personal Loan',
    interestRate: 12.5,
    minimumCreditScore: 725,
    maxTenure: 60,
    maxEmiRatio: 0.35,
    scoreAdjustment: -5,
    note: 'Unsecured loan with stricter credit and affordability checks.',
  },
  education: {
    label: 'Education Loan',
    interestRate: 10,
    minimumCreditScore: 650,
    maxTenure: 180,
    maxEmiRatio: 0.38,
    scoreAdjustment: 4,
    note: 'Education-focused loan with more flexible credit score expectations.',
  },
};

const REQUIRED_DOCUMENTS = ['aadhaar', 'pan', 'salarySlip'];

const getDocumentStatus = (documentVerification = {}) => {
  const uploadedCount = REQUIRED_DOCUMENTS.filter((key) => documentVerification[key]?.uploaded).length;
  return {
    uploadedCount,
    requiredCount: REQUIRED_DOCUMENTS.length,
    complete: uploadedCount === REQUIRED_DOCUMENTS.length,
  };
};

const computeScore = ({ income, creditScore, existingEMI, employment, loanPurpose, documentVerification }) => {
  let score = 0;
  if (income > 30000) score += 30;
  if (creditScore > 700) score += 30;
  if (existingEMI < 0.4 * income) score += 20;
  if (employment === 'stable') score += 20;

  const purposeConfig = LOAN_PURPOSE_CONFIG[loanPurpose] || LOAN_PURPOSE_CONFIG.personal;
  score += purposeConfig.scoreAdjustment;

  const documentStatus = getDocumentStatus(documentVerification);
  if (documentStatus.complete) score += 10;
  else score -= (documentStatus.requiredCount - documentStatus.uploadedCount) * 4;

  return Math.max(0, Math.min(100, score));
};

/**
 * Determine the risk level from the computed score.
 */
const getRiskLevel = (score) => {
  if (score >= 80) return 'Low';
  if (score >= 60) return 'Medium';
  return 'High';
};

/**
 * Generate human-readable reasons for the eligibility decision.
 */
const generateReasons = ({ income, creditScore, existingEMI, employment, eligible, loanPurpose, documentVerification }) => {
  const reasons = [];
  const purposeConfig = LOAN_PURPOSE_CONFIG[loanPurpose] || LOAN_PURPOSE_CONFIG.personal;
  const documentStatus = getDocumentStatus(documentVerification);

  if (eligible) {
    if (income > 30000) reasons.push('Stable and sufficient income level');
    if (creditScore > 700) reasons.push('Excellent credit history and score');
    if (existingEMI < 0.4 * income) reasons.push('Low existing debt obligations');
    if (employment === 'stable') reasons.push('Stable employment status');
    if (documentStatus.complete) reasons.push('Aadhaar, PAN, and salary slip uploaded for stronger verification');
    reasons.push(`${purposeConfig.label} rules matched with ${purposeConfig.interestRate}% estimated interest`);
  } else {
    if (income <= 30000) reasons.push('Income below ₹30,000 threshold');
    if (creditScore < purposeConfig.minimumCreditScore) reasons.push(`Credit score below ${purposeConfig.minimumCreditScore} required for ${purposeConfig.label}`);
    if (existingEMI >= purposeConfig.maxEmiRatio * income) reasons.push(`Existing EMIs exceed ${(purposeConfig.maxEmiRatio * 100).toFixed(0)}% income comfort for ${purposeConfig.label}`);
    if (employment === 'unstable') reasons.push('Unstable employment status');
    if (!documentStatus.complete) reasons.push('Aadhaar, PAN, and salary slip are required for stronger verification');
  }

  return reasons;
};

/**
 * Produce actionable suggestions to improve eligibility.
 */
const generateSuggestions = ({ income, creditScore, existingEMI, employment, eligible, loanPurpose, documentVerification }) => {
  const suggestions = [];
  const purposeConfig = LOAN_PURPOSE_CONFIG[loanPurpose] || LOAN_PURPOSE_CONFIG.personal;
  const documentStatus = getDocumentStatus(documentVerification);

  if (!eligible || true) {
    // Always provide helpful tips
    if (creditScore < purposeConfig.minimumCreditScore + 30)
      suggestions.push(`Improve your credit score for stronger ${purposeConfig.label} eligibility`);
    if (existingEMI >= 0.3 * income)
      suggestions.push('Try to close or reduce existing EMIs before applying');
    if (income <= 40000)
      suggestions.push('Provide additional income proofs (bonuses, freelance, rental income)');
    if (employment === 'unstable')
      suggestions.push('Switch to stable employment or get employer verification documents');
    if (!documentStatus.complete)
      suggestions.push('Upload Aadhaar, PAN, and latest salary slip before final approval');
    if (suggestions.length === 0)
      suggestions.push('Your profile is strong — consider applying for a higher loan amount');
  }

  return suggestions;
};

/**
 * Main analysis function — the single entry-point consumed by the controller.
 *
 * @param {Object} data - Validated input from the API
 * @returns {Object} Complete analysis result
 */
const analyzeLoan = (data) => {
  const {
    income,
    creditScore,
    existingEMI,
    loanAmount,
    tenure,
    employment,
    loanPurpose = 'personal',
    documentVerification = {},
  } = data;
  const purposeConfig = LOAN_PURPOSE_CONFIG[loanPurpose] || LOAN_PURPOSE_CONFIG.personal;
  const documentStatus = getDocumentStatus(documentVerification);

  // 1. Score & eligibility
  const score = computeScore({ income, creditScore, existingEMI, employment, loanPurpose, documentVerification });
  const probability = score; // probability mirrors score (0-100)
  const purposeEligible =
    creditScore >= purposeConfig.minimumCreditScore &&
    existingEMI < purposeConfig.maxEmiRatio * income &&
    tenure <= purposeConfig.maxTenure;
  const eligible = score >= 70 && purposeEligible && documentStatus.complete;

  // 2. Risk
  const risk = getRiskLevel(score);

  // 3. EMI calculation with purpose-specific interest rate
  const interestRate = purposeConfig.interestRate;
  const emi = calculateEMI(loanAmount, interestRate, tenure);
  const totalPayable = +(emi * tenure).toFixed(2);

  // 4. Recommended loan (50% of annual income, capped by EMI affordability)
  const maxAffordableEMI = (income - existingEMI) * 0.5;
  const recommendedLoan = +Math.min(
    loanAmount,
    maxAffordableEMI * tenure * 0.85 // 85% of max to keep safe
  ).toFixed(2);

  // 5. Reasons & suggestions
  const reasons = generateReasons({ income, creditScore, existingEMI, employment, eligible, loanPurpose, documentVerification });
  const suggestions = generateSuggestions({ income, creditScore, existingEMI, employment, eligible, loanPurpose, documentVerification });

  return {
    eligible,
    score,
    probability,
    risk,
    emi,
    interestRate,
    recommendedLoan,
    totalPayable,
    reasons,
    suggestions,
    loanPurpose,
    documentStatus,
    purposeAnalysis: {
      type: purposeConfig.label,
      minimumCreditScore: purposeConfig.minimumCreditScore,
      maxTenure: purposeConfig.maxTenure,
      maxEmiRatio: purposeConfig.maxEmiRatio,
      note: purposeConfig.note,
      purposeEligible,
    },
  };
};

module.exports = { analyzeLoan, calculateEMI, LOAN_PURPOSE_CONFIG };
