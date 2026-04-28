import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock3, RefreshCw } from 'lucide-react';
import { fetchApplications, type LoanApplicationRecord } from '../services/api';
import { useLocation } from 'react-router-dom';

type HistoryLocationState = {
  highlightId?: string;
};

const statusColor: Record<LoanApplicationRecord['status'], string> = {
  Applied: '#3b82f6',
  'Under Review': '#f59e0b',
  Approved: '#10b981',
  Rejected: '#ef4444',
};

export default function HistoryPage() {
  const location = useLocation();
  const [applications, setApplications] = useState<LoanApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const highlightedId = (location.state as HistoryLocationState | null)?.highlightId;

  const loadApplications = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetchApplications();
      setApplications(response.applications);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to load application history.';
      setError(message || 'Failed to load application history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  const totals = useMemo(() => {
    return {
      all: applications.length,
      approved: applications.filter((app) => app.status === 'Approved').length,
      review: applications.filter((app) => app.status === 'Under Review').length,
      rejected: applications.filter((app) => app.status === 'Rejected').length,
    };
  }, [applications]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="page-container"
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, marginBottom: 6 }}>
              Loan <span className="gradient-text">History</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              All submitted applications and their latest status.
            </p>
          </div>
          <button className="btn-outline" onClick={() => void loadApplications()} disabled={loading}>
            <RefreshCw size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
          <StatCard label="Total" value={totals.all} />
          <StatCard label="Approved" value={totals.approved} />
          <StatCard label="Under Review" value={totals.review} />
          <StatCard label="Rejected" value={totals.rejected} />
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, borderLeft: '4px solid var(--accent-red)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={18} color="var(--accent-red)" />
          <span style={{ color: 'var(--text-secondary)' }}>{error}</span>
        </div>
      )}

      {!loading && applications.length === 0 && (
        <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
          <Clock3 size={20} style={{ marginBottom: 10 }} />
          <p style={{ color: 'var(--text-muted)' }}>No applications found yet. Submit one from Analyze page.</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {applications.map((application) => (
          <div
            key={application._id}
            className="glass-card"
            style={{
              padding: 20,
              border: highlightedId === application._id ? '1px solid #3b82f6' : '1px solid var(--border-glass)',
              boxShadow: highlightedId === application._id ? '0 0 0 2px rgba(59,130,246,0.2)' : undefined,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>
                Application #{application._id.slice(-6).toUpperCase()}
              </p>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: statusColor[application.status],
                  background: `${statusColor[application.status]}1A`,
                  border: `1px solid ${statusColor[application.status]}44`,
                  padding: '5px 10px',
                  borderRadius: 999,
                }}
              >
                {application.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              <DataPoint label="Created" value={new Date(application.createdAt).toLocaleString()} />
              <DataPoint label="Loan Amount" value={`₹${application.loanAmount.toLocaleString('en-IN')}`} />
              <DataPoint label="Income" value={`₹${application.income.toLocaleString('en-IN')}`} />
              <DataPoint label="Credit Score" value={application.creditScore.toString()} />
              <DataPoint label="Probability" value={`${application.probability}%`} />
              <DataPoint label="EMI" value={`₹${application.emi.toLocaleString('en-IN')}`} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card" style={{ padding: 14 }}>
      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem' }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontWeight: 800, fontSize: '1.15rem' }}>{value}</p>
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.75rem' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{value}</p>
    </div>
  );
}
