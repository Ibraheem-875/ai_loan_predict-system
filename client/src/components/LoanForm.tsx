import { useState } from 'react';
import {
  IndianRupee, CreditCard, Wallet, Building2, Calendar, Briefcase, ArrowRight, ArrowLeft, Loader2,
  Home, Car, GraduationCap, User, UploadCloud, FileCheck2, Trash2, Image, AlertCircle,
} from 'lucide-react';
import type { LoanInput, LoanPurpose } from '../services/api';
import { uploadDocumentToCloud } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onSubmit: (data: LoanInput) => void;
  loading: boolean;
}

const steps = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Financial Profile' },
  { id: 3, title: 'Loan Details' },
  { id: 4, title: 'Documents' },
];

const loanPurposes: { value: LoanPurpose; label: string; icon: React.ReactNode; gradient: string }[] = [
  { value: 'home', label: 'Home Loan', icon: <Home size={20} />, gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
  { value: 'car', label: 'Car Loan', icon: <Car size={20} />, gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  { value: 'personal', label: 'Personal Loan', icon: <User size={20} />, gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  { value: 'education', label: 'Education Loan', icon: <GraduationCap size={20} />, gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
];

const documentFields = [
  { key: 'aadhaar' as const, label: 'Aadhaar Card', desc: 'Government ID for identity verification', accept: '.pdf,.jpg,.jpeg,.png,.webp' },
  { key: 'pan' as const, label: 'PAN Card', desc: 'Tax identification document', accept: '.pdf,.jpg,.jpeg,.png,.webp' },
  { key: 'salarySlip' as const, label: 'Salary Slip', desc: 'Latest 3 months salary proof', accept: '.pdf,.jpg,.jpeg,.png,.webp' },
];

export default function LoanForm({ onSubmit, loading }: Props) {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<LoanInput>({
    income: 50000, creditScore: 750, existingEMI: 5000,
    loanAmount: 500000, tenure: 60, employment: 'stable',
    loanPurpose: 'personal',
    documentVerification: {},
  });

  const handleChange = (name: keyof LoanInput, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePurposeChange = (loanPurpose: LoanPurpose) => {
    setFormData((prev) => ({ ...prev, loanPurpose }));
  };

  /** Upload a document to Cloudinary via backend */
  const handleDocumentUpload = async (docKey: 'aadhaar' | 'pan' | 'salarySlip', file?: File) => {
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors(prev => ({ ...prev, [docKey]: 'File size must be under 5MB' }));
      return;
    }

    setUploading(prev => ({ ...prev, [docKey]: true }));
    setUploadErrors(prev => ({ ...prev, [docKey]: '' }));

    try {
      const result = await uploadDocumentToCloud(file, docKey);

      setFormData((prev) => ({
        ...prev,
        documentVerification: {
          ...prev.documentVerification,
          [docKey]: {
            uploaded: true,
            fileName: result.fileName || file.name,
            fileType: result.fileType || file.type,
            fileSize: result.fileSize || file.size,
            url: result.url,
            publicId: result.publicId,
          },
        },
      }));
    } catch (err: any) {
      console.error('Upload failed:', err);
      // Fallback: store locally without Cloudinary
      setFormData((prev) => ({
        ...prev,
        documentVerification: {
          ...prev.documentVerification,
          [docKey]: {
            uploaded: true,
            fileName: file.name,
            fileType: file.type || 'unknown',
            fileSize: file.size,
          },
        },
      }));
      setUploadErrors(prev => ({
        ...prev,
        [docKey]: 'Cloud upload failed — stored locally instead',
      }));
    } finally {
      setUploading(prev => ({ ...prev, [docKey]: false }));
    }
  };

  const removeDocument = (docKey: 'aadhaar' | 'pan' | 'salarySlip') => {
    setFormData((prev) => {
      const newDocs = { ...prev.documentVerification };
      delete newDocs[docKey];
      return { ...prev, documentVerification: newDocs };
    });
    setUploadErrors(prev => ({ ...prev, [docKey]: '' }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 4) onSubmit(formData);
    else nextStep();
  };

  const fmt = (v: number, prefix = '', suffix = '') => `${prefix}${v.toLocaleString('en-IN')}${suffix}`;

  const uploadedCount = Object.values(formData.documentVerification).filter(d => d?.uploaded).length;

  const renderSlider = (name: keyof LoanInput, label: string, icon: React.ReactNode, min: number, max: number, stepVal: number, prefix = '', suffix = '') => {
    const value = formData[name] as number;
    const pct = ((value - min) / (max - min)) * 100;
    return (
      <div key={name} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {icon} {label}
          </label>
          <span style={{
            fontWeight: 800,
            fontSize: '1.05rem',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {fmt(value, prefix, suffix)}
          </span>
        </div>
        <input
          type="range" min={min} max={max} step={stepVal} value={value}
          onChange={(e) => handleChange(name, Number(e.target.value))}
          style={{
            width: '100%', height: 8, borderRadius: 4, appearance: 'none',
            background: `linear-gradient(to right, #3b82f6 ${pct}%, rgba(148,163,184,0.15) ${pct}%)`,
            cursor: 'pointer', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>{fmt(min, prefix, suffix)}</span>
          <span>{fmt(max, prefix, suffix)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card" style={{ padding: '36px 32px', overflow: 'hidden' }}>
      {/* Step Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, left: '6%', right: '6%', height: 3, background: 'rgba(148,163,184,0.1)', zIndex: 0, borderRadius: 2 }} />
        <motion.div
          style={{ position: 'absolute', top: 16, left: '6%', height: 3, background: 'var(--gradient-primary)', zIndex: 0, borderRadius: 2 }}
          initial={{ width: 0 }} animate={{ width: `${((step - 1) / (steps.length - 1)) * 88}%` }} transition={{ duration: 0.4 }}
        />
        {steps.map((s) => (
          <div key={s.id} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1 }}>
            <motion.div
              animate={{
                scale: step === s.id ? 1.1 : 1,
                background: step >= s.id ? 'var(--accent-blue)' : 'rgba(148,163,184,0.1)',
              }}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                border: step >= s.id ? 'none' : '2px solid rgba(148,163,184,0.2)',
                color: step >= s.id ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem',
                boxShadow: step === s.id ? '0 0 20px rgba(59,130,246,0.35)' : 'none',
                transition: 'all 0.3s',
              }}
            >
              {step > s.id ? '✓' : s.id}
            </motion.div>
            <span style={{ fontSize: '0.73rem', fontWeight: 700, color: step >= s.id ? 'var(--text-primary)' : 'var(--text-muted)', letterSpacing: '0.02em' }}>{s.title}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <>
                {renderSlider('creditScore', 'Credit Score', <CreditCard size={18} />, 300, 900, 10)}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 }}>
                    <Briefcase size={18} /> Employment Type
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {(['stable', 'unstable'] as const).map((type) => (
                      <button
                        key={type} type="button" onClick={() => setFormData((prev) => ({ ...prev, employment: type }))}
                        style={{
                          flex: 1, padding: '14px', borderRadius: 14,
                          border: formData.employment === type ? '2px solid var(--accent-blue)' : '1px solid rgba(148,163,184,0.15)',
                          background: formData.employment === type ? 'rgba(59, 130, 246, 0.12)' : 'rgba(148,163,184,0.04)',
                          color: formData.employment === type ? 'var(--accent-blue)' : 'var(--text-secondary)',
                          fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
                          transition: 'all 0.2s',
                          boxShadow: formData.employment === type ? '0 0 15px rgba(59,130,246,0.15)' : 'none',
                        }}
                      >
                        {type === 'stable' ? '🏢 Stable' : '🔄 Unstable'}
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
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 }}>
                    <Building2 size={18} /> Loan Purpose
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 12 }}>
                    {loanPurposes.map((purpose) => {
                      const isSelected = formData.loanPurpose === purpose.value;
                      return (
                        <motion.button
                          key={purpose.value}
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handlePurposeChange(purpose.value)}
                          style={{
                            padding: '16px 12px',
                            borderRadius: 14,
                            border: isSelected ? '2px solid transparent' : '1px solid rgba(148,163,184,0.15)',
                            background: isSelected ? purpose.gradient : 'rgba(148,163,184,0.04)',
                            color: isSelected ? 'white' : 'var(--text-secondary)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
                          }}
                        >
                          {purpose.icon}
                          <span style={{ fontSize: '0.85rem' }}>{purpose.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                {renderSlider('loanAmount', 'Desired Loan Amount', <Building2 size={18} />, 50000, 10000000, 10000, '₹')}
                {renderSlider('tenure', 'Tenure (Months)', <Calendar size={18} />, 6, 360, 6, '', ' mos')}
              </>
            )}

            {step === 4 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Upload Documents</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 0' }}>
                      Upload via Cloudinary for secure verification
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700, padding: '6px 14px', borderRadius: 99,
                    background: uploadedCount === 3 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    color: uploadedCount === 3 ? 'var(--accent-green)' : 'var(--accent-yellow)',
                    border: `1px solid ${uploadedCount === 3 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  }}>
                    {uploadedCount}/3 Uploaded
                  </span>
                </div>

                <div style={{ display: 'grid', gap: 14 }}>
                  {documentFields.map((field) => {
                    const doc = formData.documentVerification[field.key];
                    const isUploading = uploading[field.key];
                    const error = uploadErrors[field.key];
                    const isUploaded = doc?.uploaded;

                    return (
                      <motion.div
                        key={field.key}
                        whileHover={{ scale: 1.01 }}
                        style={{
                          borderRadius: 16,
                          border: isUploaded ? '1px solid rgba(16,185,129,0.35)' : '1px dashed rgba(148,163,184,0.25)',
                          background: isUploaded ? 'rgba(16,185,129,0.06)' : 'rgba(148,163,184,0.03)',
                          overflow: 'hidden',
                          transition: 'all 0.3s',
                        }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 16,
                            padding: '18px 20px',
                            cursor: isUploading ? 'wait' : 'pointer',
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                            <span style={{
                              width: 44, height: 44, borderRadius: 12,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: isUploaded ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.08)',
                              flexShrink: 0,
                            }}>
                              {isUploading ? (
                                <Loader2 size={20} color="var(--accent-blue)" style={{ animation: 'spin 1s linear infinite' }} />
                              ) : isUploaded ? (
                                <FileCheck2 size={20} color="var(--accent-green)" />
                              ) : (
                                <UploadCloud size={20} color="var(--text-muted)" />
                              )}
                            </span>
                            <span style={{ minWidth: 0 }}>
                              <strong style={{ display: 'block', fontSize: '0.95rem' }}>{field.label}</strong>
                              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {isUploading ? 'Uploading to cloud...' : isUploaded ? doc.fileName : field.desc}
                              </span>
                              {isUploaded && doc.url && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                  <Image size={12} color="var(--accent-cyan)" />
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textDecoration: 'none' }}
                                  >
                                    View on Cloud ↗
                                  </a>
                                </span>
                              )}
                            </span>
                          </span>

                          <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            {isUploaded && (
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeDocument(field.key); }}
                                style={{
                                  width: 34, height: 34, borderRadius: 8, border: 'none',
                                  background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                            <span style={{
                              fontSize: '0.8rem', fontWeight: 700, padding: '6px 14px', borderRadius: 10,
                              background: isUploaded ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.1)',
                              color: isUploaded ? 'var(--accent-green)' : 'var(--accent-blue)',
                            }}>
                              {isUploading ? 'Uploading...' : isUploaded ? '✓ Done' : 'Choose'}
                            </span>
                          </span>

                          <input
                            type="file"
                            accept={field.accept}
                            onChange={(event) => handleDocumentUpload(field.key, event.target.files?.[0])}
                            style={{ display: 'none' }}
                            disabled={isUploading}
                          />
                        </label>

                        {error && (
                          <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertCircle size={13} color="var(--accent-yellow)" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-yellow)' }}>{error}</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 16, marginTop: 36 }}>
          {step > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '15px' }}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <button type="submit" disabled={loading || Object.values(uploading).some(Boolean)} className="btn-primary" style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '15px', fontSize: '1rem' }}>
            {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : step === 4 ? '🚀 Run Analysis' : 'Continue'}
            {!loading && step !== 4 && <ArrowRight size={18} />}
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
