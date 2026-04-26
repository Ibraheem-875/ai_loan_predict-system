import { useState } from 'react';
import {
  IndianRupee, CreditCard, Wallet, Building2, Calendar, Briefcase, ArrowRight, ArrowLeft, Loader2,
} from 'lucide-react';
import type { LoanInput } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onSubmit: (data: LoanInput) => void;
  loading: boolean;
}

const steps = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Financial Profile' },
  { id: 3, title: 'Loan Details' }
];

export default function LoanForm({ onSubmit, loading }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<LoanInput>({
    income: 50000, creditScore: 750, existingEMI: 5000,
    loanAmount: 500000, tenure: 60, employment: 'stable',
  });

  const handleChange = (name: keyof LoanInput, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 3) onSubmit(formData);
    else nextStep();
  };

  const fmt = (v: number, prefix = '', suffix = '') => `${prefix}${v.toLocaleString('en-IN')}${suffix}`;

  const renderSlider = (name: keyof LoanInput, label: string, icon: React.ReactNode, min: number, max: number, stepVal: number, prefix = '', suffix = '') => (
    <div key={name} style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {icon} {label}
        </label>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
          {fmt(formData[name] as number, prefix, suffix)}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={stepVal} value={formData[name] as number}
        onChange={(e) => handleChange(name, Number(e.target.value))}
        style={{ width: '100%', height: 6, borderRadius: 3, appearance: 'none', background: `linear-gradient(to right, #3b82f6 ${((formData[name] as number - min) / (max - min)) * 100}%, rgba(148,163,184,0.2) ${((formData[name] as number - min) / (max - min)) * 100}%)`, cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span>{fmt(min, prefix, suffix)}</span>
        <span>{fmt(max, prefix, suffix)}</span>
      </div>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: '32px', overflow: 'hidden' }}>
      {/* Step Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 14, left: 0, right: 0, height: 2, background: 'var(--border-glass)', zIndex: 0 }} />
        <motion.div 
          style={{ position: 'absolute', top: 14, left: 0, height: 2, background: 'var(--gradient-primary)', zIndex: 0 }} 
          initial={{ width: 0 }} animate={{ width: `${(step - 1) * 50}%` }} transition={{ duration: 0.3 }}
        />
        {steps.map((s) => (
          <div key={s.id} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: step >= s.id ? 'var(--accent-blue)' : 'var(--bg-glass)', border: step >= s.id ? 'none' : '2px solid var(--border-glass)', color: step >= s.id ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.3s' }}>
              {s.id}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: step >= s.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.title}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={step} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <>
                {renderSlider('creditScore', 'Credit Score', <CreditCard size={18} />, 300, 900, 10)}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    <Briefcase size={18} /> Employment Type
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {(['stable', 'unstable'] as const).map((type) => (
                      <button
                        key={type} type="button" onClick={() => setFormData((prev) => ({ ...prev, employment: type }))}
                        style={{ flex: 1, padding: '12px', borderRadius: 12, border: formData.employment === type ? '2px solid var(--accent-blue)' : '1px solid var(--border-glass)', background: formData.employment === type ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-glass)', color: formData.employment === type ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {renderSlider('income', 'Monthly Income', <IndianRupee size={18} />, 5000, 500000, 1000, '₹')}
                {renderSlider('existingEMI', 'Existing EMI', <Wallet size={18} />, 0, 200000, 500, '₹')}
              </>
            )}

            {step === 3 && (
              <>
                {renderSlider('loanAmount', 'Desired Loan Amount', <Building2 size={18} />, 50000, 10000000, 10000, '₹')}
                {renderSlider('tenure', 'Tenure (Months)', <Calendar size={18} />, 6, 360, 6, '', ' mos')}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
          {step > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '14px' }}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '14px' }}>
            {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing</> : step === 3 ? 'Run Analysis' : 'Continue'}
            {!loading && step !== 3 && <ArrowRight size={18} />}
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
 