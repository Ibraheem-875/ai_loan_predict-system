import { useState } from 'react';
import { CheckCircle2, Clock, FileSearch, XCircle } from 'lucide-react';
import { updateLoanStatus } from '../services/api';

const STEPS = [
  { key: 'Applied', label: 'Applied', icon: <CheckCircle2 size={18} /> },
  { key: 'Under Review', label: 'Under Review', icon: <FileSearch size={18} /> },
  { key: 'Approved', label: 'Approved', icon: <CheckCircle2 size={18} /> },
  { key: 'Rejected', label: 'Rejected', icon: <XCircle size={18} /> },
];

interface Props { applicationId?: string; }

export default function StatusTracker({ applicationId }: Props) {
  const [status, setStatus] = useState('Applied');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getColor = (step: string) => {
    if (step === status) {
      if (step === 'Rejected') return '#ef4444';
      if (step === 'Approved') return '#10b981';
      return '#3b82f6';
    }
    const idx = STEPS.findIndex(s => s.key === status);
    const sIdx = STEPS.findIndex(s => s.key === step);
    return sIdx < idx ? '#10b981' : 'var(--text-muted)';
  };

  const advance = async () => {
    if (!applicationId) {
      setError('Application ID unavailable. Status sync requires database persistence.');
      return;
    }

    const nextStatus = status === 'Applied' ? 'Under Review' : status === 'Under Review' ? 'Approved' : status;
    if (nextStatus === status) return;

    setError(null);
    setUpdating(true);
    try {
      await updateLoanStatus(applicationId, nextStatus);
      setStatus(nextStatus);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in-up delay-5" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Application Status</h4>
        {status !== 'Approved' && status !== 'Rejected' && (
          <button
            onClick={() => void advance()}
            disabled={updating}
            className="btn-outline"
            style={{ padding: '6px 16px', fontSize: '0.8rem' }}
          >
            <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {updating ? 'Updating...' : 'Simulate Next Step'}
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: 14 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {STEPS.filter(s => !(s.key === 'Rejected' && status !== 'Rejected')).map((step, i, arr) => (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${getColor(step.key)}22`, border: `2px solid ${getColor(step.key)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getColor(step.key), transition: 'all 0.3s ease' }}>
                {step.icon}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: getColor(step.key), whiteSpace: 'nowrap' }}>{step.label}</span>
            </div>
            {i < arr.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 8px', marginBottom: 20, background: `linear-gradient(90deg, ${getColor(step.key)}, ${getColor(arr[i + 1].key)})`, borderRadius: 1 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
 
