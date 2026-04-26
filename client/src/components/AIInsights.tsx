import { Bot, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';
import type { LoanResult } from '../services/api';

interface Props {
  result: LoanResult;
  isEnabled: boolean;
  onToggle: () => void;
}

export default function AIInsights({ result, isEnabled, onToggle }: Props) {
  const { ai } = result;

  return (
    <div className="animate-fade-in-up delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-purple)' }}>
          <Bot size={22} />
          🤖 AI Insights
        </h3>
        
        {/* Toggle Switch */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isEnabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {isEnabled ? 'ON' : 'OFF'}
          </span>
          <div 
            onClick={onToggle}
            style={{ 
              width: 44, 
              height: 24, 
              borderRadius: 12, 
              background: isEnabled ? 'var(--gradient-primary)' : 'rgba(148, 163, 184, 0.2)',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
          >
            <div 
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: 2,
                left: isEnabled ? 22 : 2,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            />
          </div>
        </label>
      </div>

      {isEnabled && ai && (
        <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(139, 92, 246, 0.3)', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative background glow */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* AI Summary */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} /> Summary
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {ai.summary}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Explanation */}
            <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(139, 92, 246, 0.1)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Explanation</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {ai.explanation}
              </p>
            </div>

            {/* Risk Analysis */}
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(245, 158, 11, 0.1)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} color="var(--accent-yellow)" /> Risk Analysis
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {ai.riskAnalysis}
              </p>
            </div>
          </div>

          {/* Suggestions */}
          {ai.suggestions && ai.suggestions.length > 0 && (
            <div style={{ marginTop: 20, background: 'rgba(16, 185, 129, 0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.1)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lightbulb size={16} color="var(--accent-green)" /> AI Suggestions
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                {ai.suggestions.map((suggestion, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent-green)', marginTop: 2 }}>•</span>
                    <span style={{ lineHeight: 1.5 }}>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 