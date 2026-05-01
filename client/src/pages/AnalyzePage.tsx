import { useState, useRef } from 'react';
import LoanForm from '../components/LoanForm';
import EligibilityResult from '../components/EligibilityResult';
import EMIBreakdown from '../components/EMIBreakdown';
import RiskIndicator from '../components/RiskIndicator';
import ExplanationEngine from '../components/ExplanationEngine';
import Charts from '../components/Charts';
import StatusTracker from '../components/StatusTracker';
import ActionButtons from '../components/ActionButtons';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AIInsights from '../components/AIInsights';
import NotificationToast from '../components/NotificationToast';
import { analyzeLoan as callAnalyze } from '../services/api';
import { generatePDFReport } from '../utils/pdfGenerator';
import type { LoanInput, LoanResult } from '../services/api';
import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AnalyzePage() {
  const [result, setResult] = useState<LoanResult | null>(null);
  const [input, setInput] = useState<LoanInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [notification, setNotification] = useState<{ message: string; tone: 'success' | 'info' } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  /** Submit the form and call the backend */
  const handleSubmit = async (data: LoanInput) => {
    setLoading(true);
    setError(null);
    setApplied(false);
    setInput(data);
    try {
      const res = await callAnalyze(data);
      setResult(res);
      setNotification({
        message: res.eligible ? 'Loan Approved Successfully' : 'Application Saved',
        tone: res.eligible ? 'success' : 'info',
      });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /** Reset for recalculation */
  const handleRecalculate = () => {
    setResult(null);
    setInput(null);
    setApplied(false);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Download PDF report */
  const handleDownload = () => {
    if (input && result) generatePDFReport(input, result);
  };

  const handleApply = () => {
    setApplied(true);
    setNotification({ message: 'Application Saved', tone: 'success' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="page-container"
    >
      <AnimatePresence>
        {notification && (
          <NotificationToast
            message={notification.message}
            tone={notification.tone}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 12 }}>
          Check <span className="gradient-text">Loan Eligibility</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>
          Enter your financial details below to get an instant AI-powered loan eligibility report.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
        <LoanForm onSubmit={handleSubmit} loading={loading} />

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: 24, borderLeft: '4px solid var(--accent-red)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <AlertTriangle size={24} color="var(--accent-red)" />
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--accent-red)', marginBottom: 4 }}>Analysis Failed</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{error}</p>
            </div>
          </motion.div>
        )}

        {loading && <LoadingSkeleton />}

        {result && input && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }}
            ref={resultRef} 
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              <EligibilityResult result={result} />
              <EMIBreakdown result={result} />
            </div>
            <RiskIndicator result={result} />
            <AIInsights result={result} isEnabled={aiEnabled} onToggle={() => setAiEnabled(!aiEnabled)} />
            <ExplanationEngine result={result} />
            <Charts input={input} result={result} />
            <ActionButtons onApply={handleApply} onRecalculate={handleRecalculate} onDownload={handleDownload} />
            {applied && <StatusTracker applicationId={result.applicationId} />}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
