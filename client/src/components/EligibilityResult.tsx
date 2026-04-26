import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import type { LoanResult } from '../services/api';

interface Props {
  result: LoanResult;
}

/**
 * Eligibility verdict banner + approval probability gauge.
 */
export default function EligibilityResult({ result }: Props) {
  const { eligible, probability, score } = result;

  return (
    <div
      className="glass-card animate-fade-in-up delay-1"
      style={{
        padding: 28,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Coloured top border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: eligible ? 'var(--gradient-success)' : 'var(--gradient-danger)',
        }}
      />

      {/* Verdict */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
        }}
      >
        {eligible ? (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={28} color="#10b981" />
          </div>
        ) : (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XCircle size={28} color="#ef4444" />
          </div>
        )}

        <div>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: eligible ? '#10b981' : '#ef4444',
            }}
          >
            {eligible ? 'You Are Eligible for Loan' : 'You Are Not Eligible for Loan'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Based on your financial profile analysis
          </p>
        </div>
      </div>

      {/* Probability gauge */}
      <div style={{ marginTop: 8 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={16} color="var(--accent-blue)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Approval Probability
            </span>
          </div>
          <span
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: eligible ? '#10b981' : '#ef4444',
            }}
          >
            {probability}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: 10,
            borderRadius: 5,
            background: 'rgba(148, 163, 184, 0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${probability}%`,
              height: '100%',
              borderRadius: 5,
              background:
                probability >= 70
                  ? 'var(--gradient-success)'
                  : probability >= 50
                  ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                  : 'var(--gradient-danger)',
              transition: 'width 1s ease-out',
            }}
          />
        </div>

        {/* Score */}
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          Score: <strong style={{ color: 'var(--text-primary)' }}>{score}</strong> / 100
        </p>
      </div>
    </div>
  );
}
 