import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import type { LoanResult } from '../services/api';

interface Props {
  result: LoanResult;
}

/**
 * Colour-coded risk indicator (Low / Medium / High).
 */
export default function RiskIndicator({ result }: Props) {
  const config = {
    Low: {
      icon: <ShieldCheck size={28} />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      label: 'Low Risk',
      desc: 'Your profile indicates a strong financial standing.',
    },
    Medium: {
      icon: <ShieldAlert size={28} />,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      label: 'Medium Risk',
      desc: 'Some factors need attention. See suggestions below.',
    },
    High: {
      icon: <ShieldX size={28} />,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
      label: 'High Risk',
      desc: 'Significant improvements needed before applying.',
    },
  };

  const c = config[result.risk];

  return (
    <div
      className="glass-card animate-fade-in-up delay-3"
      style={{
        padding: 24,
        borderLeft: `4px solid ${c.color}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: c.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: c.color,
          }}
        >
          {c.icon}
        </div>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: c.color }}>{c.label}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>{c.desc}</p>
        </div>
      </div>
    </div>
  );
}
 