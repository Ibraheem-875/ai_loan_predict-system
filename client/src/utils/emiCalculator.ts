/**
 * EMI Calculator Utility
 *
 * Formula:
 *   EMI = (P × r × (1+r)^n) / ((1+r)^n - 1)
 *
 * Where:
 *   P = principal (loan amount)
 *   r = monthly interest rate (annual rate / 12 / 100)
 *   n = tenure in months
 */

export const calculateEMI = (
  principal: number,
  annualRate: number,
  tenureMonths: number
): number => {
  const r = annualRate / 12 / 100;
  if (r === 0) return +(principal / tenureMonths).toFixed(2);

  const onePlusR = Math.pow(1 + r, tenureMonths);
  const emi = (principal * r * onePlusR) / (onePlusR - 1);
  return +emi.toFixed(2);
};

/** Format a number as Indian Rupees (₹) */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Format a number with commas */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};
