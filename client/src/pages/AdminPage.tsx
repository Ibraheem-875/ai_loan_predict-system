import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BarChart3, CheckCircle2, Clock3, RefreshCw, Users, XCircle } from 'lucide-react';
import { fetchAdminStats, type AdminStats } from '../services/api';

const emptyStats: AdminStats = {
  totalUsers: 0,
  totalApplications: 0,
  approvedApplications: 0,
  rejectedApplications: 0,
  approvalRatio: 0,
  pendingApplications: 0,
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await fetchAdminStats());
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to load admin metrics.';
      setError(message || 'Failed to load admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, []);

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
              Admin <span className="gradient-text">Panel</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              User count, application volume, approvals, and rejection tracking.
            </p>
          </div>
          <button className="btn-outline" onClick={() => void loadStats()} disabled={loading}>
            <RefreshCw size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, borderLeft: '4px solid var(--accent-red)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={18} color="var(--accent-red)" />
          <span style={{ color: 'var(--text-secondary)' }}>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        <MetricCard label="Total Users" value={stats.totalUsers} icon={<Users size={20} />} color="var(--accent-blue)" />
        <MetricCard label="Total Applications" value={stats.totalApplications} icon={<BarChart3 size={20} />} color="var(--accent-cyan)" />
        <MetricCard label="Approval Ratio" value={`${stats.approvalRatio}%`} icon={<CheckCircle2 size={20} />} color="var(--accent-green)" />
        <MetricCard label="Rejected Applications" value={stats.rejectedApplications} icon={<XCircle size={20} />} color="var(--accent-red)" />
        <MetricCard label="Approved Applications" value={stats.approvedApplications} icon={<CheckCircle2 size={20} />} color="var(--accent-green)" />
        <MetricCard label="Pending Review" value={stats.pendingApplications} icon={<Clock3 size={20} />} color="var(--accent-yellow)" />
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-card" style={{ padding: 20, minHeight: 130 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>{label}</p>
        <span style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', color, background: `${color}1A` }}>
          {icon}
        </span>
      </div>
      <p style={{ margin: '18px 0 0', fontSize: '2rem', fontWeight: 900 }}>{value}</p>
    </div>
  );
}
