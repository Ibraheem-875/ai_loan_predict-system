import jsPDF from 'jspdf';
import type { LoanResult, LoanInput } from '../services/api';
import { formatCurrency } from './emiCalculator';

/**
 * Generate and download a PDF report of the loan analysis.
 */
export const generatePDFReport = (input: LoanInput, result: LoanResult): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ─── Helper: centered text ───
  const centerText = (text: string, yPos: number, size: number = 12) => {
    doc.setFontSize(size);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, yPos);
  };

  // ─── Header ───
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  centerText('AI Loan Eligibility & Risk Analyzer', y, 20);
  y += 10;
  doc.setFont('helvetica', 'normal');
  centerText('Comprehensive Analysis Report', y, 12);
  y += 8;
  doc.setFontSize(9);
  centerText(`Generated on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, y);
  y += 18;

  // ─── Eligibility Result ───
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Eligibility Result', 15, y);
  y += 8;

  if (result.eligible) {
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(15, y - 5, pageWidth - 30, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    centerText('YOU ARE ELIGIBLE FOR LOAN', y + 3);
  } else {
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(15, y - 5, pageWidth - 30, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    centerText('YOU ARE NOT ELIGIBLE FOR LOAN', y + 3);
  }
  y += 18;

  // ─── Key Metrics ───
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Key Metrics', 15, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  // Format currency safe for jsPDF (replace ₹ and non-breaking spaces)
  const safeCurrency = (val: number) => formatCurrency(val).replace(/₹/g, 'Rs.').replace(/\u00A0/g, ' ');

  const metrics = [
    ['Approval Score', `${result.score} / 100`],
    ['Approval Probability', `${result.probability}%`],
    ['Risk Level', result.risk],
    ['Monthly EMI', safeCurrency(result.emi)],
    ['Interest Rate', `${result.interestRate}% p.a.`],
    ['Total Payable Amount', safeCurrency(result.totalPayable)],
    ['Recommended Loan Amount', safeCurrency(result.recommendedLoan)],
  ];

  metrics.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(value, pageWidth - 20, y, { align: 'right' });
    y += 7;
  });
  y += 5;

  // ─── Applicant Details ───
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Applicant Details', 15, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const details = [
    ['Monthly Income', safeCurrency(input.income)],
    ['Credit Score', `${input.creditScore}`],
    ['Existing EMI', safeCurrency(input.existingEMI)],
    ['Requested Loan Amount', safeCurrency(input.loanAmount)],
    ['Tenure', `${input.tenure} months`],
    ['Loan Purpose', result.purposeAnalysis?.type || input.loanPurpose],
    ['Documents Uploaded', `${result.documentStatus?.uploadedCount ?? 0}/${result.documentStatus?.requiredCount ?? 3}`],
    ['Employment Type', input.employment.charAt(0).toUpperCase() + input.employment.slice(1)],
  ];

  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(value, pageWidth - 20, y, { align: 'right' });
    y += 7;
  });
  y += 5;

  // ─── AI Insights ───
  // Helper to remove unsupported unicode characters from LLM outputs
  const safeText = (str: string) => {
    return (str || '')
      .replace(/[“”\u201C\u201D]/g, '"')
      .replace(/[‘’\u2018\u2019]/g, "'")
      .replace(/[—–\u2013\u2014]/g, '-')
      .replace(/[•\u2022]/g, '-')
      .replace(/₹/g, 'Rs.');
  };

  if (result.ai && result.ai.summary) {
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('AI Insights Summary', 15, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(safeText(result.ai.summary), pageWidth - 40);
    doc.text(lines, 20, y);
    y += lines.length * 6 + 5;
  }

  // ─── Reasons ───
  if (result.reasons.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(result.eligible ? 'Positive Factors' : 'Areas of Concern', 15, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    result.reasons.forEach((reason) => {
      doc.setTextColor(60, 60, 60);
      doc.text(`-  ${safeText(reason)}`, 20, y);
      y += 7;
    });
    y += 5;
  }

  // ─── Suggestions ───
  if (result.suggestions.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Suggestions for Improvement', 15, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    result.suggestions.forEach((suggestion) => {
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(`-  ${safeText(suggestion)}`, pageWidth - 40);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 2;
    });
    y += 5;
  }

  // ─── Footer ───
  doc.setFillColor(241, 245, 249);
  doc.rect(0, doc.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  centerText(
    'This report is auto-generated by AI Loan Eligibility & Risk Analyzer. For informational purposes only.',
    doc.internal.pageSize.getHeight() - 10
  );

  // ─── Download ───
  doc.save('Loan_Analysis_Report.pdf');
};
