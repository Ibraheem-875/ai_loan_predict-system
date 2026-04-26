import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import type { LoanResult } from '../services/api';

interface Props { result: LoanResult; }

export default function ExplanationEngine({ result }: Props) {
  const { eligible, reasons, suggestions } = result;

  return (
    <div className="animate-fade-in-up delay-4" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="glass-card" style={{ padding: 24 }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: eligible ? '#10b981' : '#ef4444' }}>
          {eligible ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {eligible ? 'Why You Qualified' : "Why You Didn't Qualify"}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reasons.map((reason, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: eligible ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${eligible ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
              <span style={{ marginTop: 2, fontSize: '0.9rem', fontWeight: 700, color: eligible ? '#10b981' : '#ef4444', flexShrink: 0 }}>{eligible ? '✔' : '✘'}</span>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-cyan)' }}>
            <Info size={18} /> Suggestions for Improvement
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)' }}>
                <span style={{ marginTop: 2, fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
 