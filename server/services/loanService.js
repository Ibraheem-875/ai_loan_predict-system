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
const computeScore = ({ income, creditScore, existingEMI, employment }) => {
  let score = 0;
  if (income > 30000) score += 30;
  if (creditScore > 700) score += 30;
  if (existingEMI < 0.4 * income) score += 20;
  if (employment === 'stable') score += 20;
  return score;
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
const generateReasons = ({ income, creditScore, existingEMI, employment, eligible }) => {
  const reasons = [];

  if (eligible) {
    if (income > 30000) reasons.push('Stable and sufficient income level');
    if (creditScore > 700) reasons.push('Excellent credit history and score');
    if (existingEMI < 0.4 * income) reasons.push('Low existing debt obligations');
    if (employment === 'stable') reasons.push('Stable employment status');
  } else {
    if (income <= 30000) reasons.push('Income below ₹30,000 threshold');
    if (creditScore <= 700) reasons.push('Credit score below 700 — considered poor');
    if (existingEMI >= 0.4 * income) reasons.push('Existing EMIs exceed 40% of income');
    if (employment === 'unstable') reasons.push('Unstable employment status');
  }

  return reasons;
};

/**
 * Produce actionable suggestions to improve eligibility.
 */
const generateSuggestions = ({ income, creditScore, existingEMI, employment, eligible }) => {
  const suggestions = [];

  if (!eligible || true) {
    // Always provide helpful tips
    if (creditScore <= 750)
      suggestions.push('Improve your credit score by paying bills on time and reducing credit utilisation');
    if (existingEMI >= 0.3 * income)
      suggestions.push('Try to close or reduce existing EMIs before applying');
    if (income <= 40000)
      suggestions.push('Provide additional income proofs (bonuses, freelance, rental income)');
    if (employment === 'unstable')
      suggestions.push('Switch to stable employment or get employer verification documents');
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
  const { income, creditScore, existingEMI, loanAmount, tenure, employment } = data;

  // 1. Score & eligibility
  const score = computeScore({ income, creditScore, existingEMI, employment });
  const probability = score; // probability mirrors score (0-100)
  const eligible = score >= 70;

  // 2. Risk
  const risk = getRiskLevel(score);

  // 3. EMI calculation (assume 10% annual interest rate)
  const interestRate = 10;
  const emi = calculateEMI(loanAmount, interestRate, tenure);
  const totalPayable = +(emi * tenure).toFixed(2);

  // 4. Recommended loan (50% of annual income, capped by EMI affordability)
  const maxAffordableEMI = (income - existingEMI) * 0.5;
  const recommendedLoan = +Math.min(
    loanAmount,
    maxAffordableEMI * tenure * 0.85 // 85% of max to keep safe
  ).toFixed(2);

  // 5. Reasons & suggestions
  const reasons = generateReasons({ income, creditScore, existingEMI, employment, eligible });
  const suggestions = generateSuggestions({ income, creditScore, existingEMI, employment, eligible });

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
  };
};

module.exports = { analyzeLoan, calculateEMI };
