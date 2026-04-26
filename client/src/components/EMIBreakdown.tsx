import { Banknote, Percent, Receipt, Target } from 'lucide-react';
import type { LoanResult } from '../services/api';
import { formatCurrency } from '../utils/emiCalculator';

interface Props {
  result: LoanResult;
}

/**
 * EMI breakdown cards — Monthly EMI, Interest Rate, Total Payable, Recommended Loan.
 */
export default function EMIBreakdown({ result }: Props) {
  const cards = [
    {
      icon: <Banknote size={22} />,
      label: 'Monthly EMI',
      value: formatCurrency(result.emi),
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      icon: <Percent size={22} />,
      label: 'Interest Rate',
      value: `${result.interestRate}% p.a.`,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
    {
      icon: <Receipt size={22} />,
      label: 'Total Payable',
      value: formatCurrency(result.totalPayable),
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.1)',
    },
    {
      icon: <Target size={22} />,
      label: 'Recommended Loan',
      value: formatCurrency(result.recommendedLoan),
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  return (
    <div className="animate-fade-in-up delay-2">
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
        EMI Breakdown
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.label}
            className="glass-card"
            style={{
              padding: '20px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
              }}
            >
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {card.label}
              </p>
              <p
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: card.color,
                  marginTop: 2,
                }}
              >
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
 