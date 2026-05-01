import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, BarChart3, CheckCircle2, Clock3, RefreshCw, Users, XCircle,
  TrendingUp, Shield, PieChart, Activity, ArrowUpRight, Home, Car, GraduationCap, User,
  FileCheck2, FileX2, Eye,
} from 'lucide-react';
import { fetchAdminStats, fetchApplications, updateLoanStatus, type AdminStats, type LoanApplicationRecord } from '../services/api';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const emptyStats: AdminStats = {
  totalUsers: 0, totalApplications: 0, approvedApplications: 0,
  rejectedApplications: 0, approvalRatio: 0, pendingApplications: 0,
};

const purposeIcons: Record<string, React.ReactNode> = {
  home: <Home size={15} />, car: <Car size={15} />,
  personal: <User size={15} />, education: <GraduationCap size={15} />,
};

const statusColors: Record<string, string> = {
  Applied: '#3b82f6', 'Under Review': '#f59e0b', Approved: '#10b981', Rejected: '#ef4444',
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [apps, setApps] = useState<LoanApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'applications'>('overview');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [s, a] = await Promise.all([fetchAdminStats(), fetchApplications()]);
      setStats(s); setApps(a.applications);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to load data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateLoanStatus(id, status);
      setApps(prev => prev.map(a => a._id === id ? { ...a, status: status as any } : a));
      void load();
    } catch { /* silent */ }
  };

  const pieData = [
    { name: 'Approved', value: stats.approvedApplications, color: '#10b981' },
    { name: 'Rejected', value: stats.rejectedApplications, color: '#ef4444' },
    { name: 'Pending', value: stats.pendingApplications, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const purposeCounts = apps.reduce((acc, a) => {
    const p = a.loanPurpose || 'personal';
    acc[p] = (acc[p] || 0) + 1; return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div className="glass-card" style={{ padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--gradient-primary)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}>
              <Shield size={26} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                Admin <span className="gradient-text">Command Center</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                Real-time metrics, applications & approval management
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', background: 'rgba(148,163,184,0.06)', borderRadius: 12, border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
              {(['overview', 'applications'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                  background: tab === t ? 'var(--gradient-primary)' : 'transparent',
                  color: tab === t ? 'white' : 'var(--text-muted)', textTransform: 'capitalize', transition: 'all 0.2s',
                }}>{t === 'overview' ? '📊 Overview' : '📋 Applications'}</button>
              ))}
            </div>
            <button className="btn-outline" onClick={() => void load()} disabled={loading} style={{ padding: '10px 18px' }}>
              <RefreshCw size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, borderLeft: '4px solid var(--accent-red)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={18} color="var(--accent-red)" /><span style={{ color: 'var(--text-secondary)' }}>{error}</span>
        </div>
      )}

      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <StatCard label="Total Users" value={stats.totalUsers} icon={<Users size={22} />} color="#3b82f6" gradient="linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))" />
            <StatCard label="Total Applications" value={stats.totalApplications} icon={<BarChart3 size={22} />} color="#06b6d4" gradient="linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))" />
            <StatCard label="Approval Ratio" value={`${stats.approvalRatio}%`} icon={<TrendingUp size={22} />} color="#10b981" gradient="linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))" />
            <StatCard label="Approved" value={stats.approvedApplications} icon={<CheckCircle2 size={22} />} color="#10b981" gradient="linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))" />
            <StatCard label="Rejected" value={stats.rejectedApplications} icon={<XCircle size={22} />} color="#ef4444" gradient="linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))" />
            <StatCard label="Pending Review" value={stats.pendingApplications} icon={<Clock3 size={22} />} color="#f59e0b" gradient="linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))" />
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {/* Pie Chart */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChart size={18} color="var(--accent-purple)" /> Application Distribution
              </h3>
              {pieData.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <ResponsiveContainer width="50%" height={180}>
                    <RPieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                      {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie><Tooltip /></RPieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.name}</span>
                        <span style={{ fontWeight: 800, marginLeft: 'auto' }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>No application data yet</p>
              )}
            </div>

            {/* Loan Purpose Breakdown */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color="var(--accent-cyan)" /> Loan Purpose Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(purposeCounts).length > 0 ? Object.entries(purposeCounts).map(([purpose, count]) => {
                  const pct = apps.length ? Math.round((count / apps.length) * 100) : 0;
                  const colors: Record<string, string> = { home: '#3b82f6', car: '#8b5cf6', personal: '#06b6d4', education: '#10b981' };
                  const c = colors[purpose] || '#64748b';
                  return (
                    <div key={purpose}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600, textTransform: 'capitalize' }}>
                          {purposeIcons[purpose]} {purpose} Loan
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: c }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: 7, borderRadius: 4, background: 'rgba(148,163,184,0.1)' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: c, transition: 'width 0.6s' }} />
                      </div>
                    </div>
                  );
                }) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No data</p>}
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock3 size={18} color="var(--accent-yellow)" /> Recent Applications
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    {['ID', 'Purpose', 'Amount', 'Score', 'Docs', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apps.slice(0, 8).map(app => (
                    <tr key={app._id} style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, fontFamily: 'monospace' }}>#{app._id.slice(-6).toUpperCase()}</td>
                      <td style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'capitalize' }}>
                        {purposeIcons[app.loanPurpose]} {app.loanPurpose}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>₹{app.loanAmount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{app.score}/100</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {app.documentStatus?.complete ? <FileCheck2 size={14} color="#10b981" /> : <FileX2 size={14} color="#f59e0b" />}
                          {app.documentStatus?.uploadedCount ?? 0}/{app.documentStatus?.requiredCount ?? 3}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: statusColors[app.status], background: `${statusColors[app.status]}18`, padding: '4px 10px', borderRadius: 99, border: `1px solid ${statusColors[app.status]}33` }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {apps.length === 0 && <p style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No applications yet</p>}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'applications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {apps.map(app => (
            <div key={app._id} className="glass-card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: app.eligible ? 'var(--gradient-success)' : 'var(--gradient-danger)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>#{app._id.slice(-6).toUpperCase()}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{new Date(app.createdAt).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={app.status} onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border-glass)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                    {['Applied', 'Under Review', 'Approved', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: statusColors[app.status], background: `${statusColors[app.status]}18`, padding: '6px 14px', borderRadius: 99, border: `1px solid ${statusColors[app.status]}33` }}>
                    {app.status}
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                <MiniStat label="Income" value={`₹${app.income.toLocaleString('en-IN')}`} />
                <MiniStat label="Loan Amount" value={`₹${app.loanAmount.toLocaleString('en-IN')}`} />
                <MiniStat label="Purpose" value={app.purposeAnalysis?.type || app.loanPurpose} />
                <MiniStat label="Credit Score" value={`${app.creditScore}`} />
                <MiniStat label="EMI" value={`₹${app.emi.toLocaleString('en-IN')}`} />
                <MiniStat label="Score" value={`${app.score}/100`} />
                <MiniStat label="Risk" value={app.risk} />
                <MiniStat label="Docs" value={`${app.documentStatus?.uploadedCount ?? 0}/${app.documentStatus?.requiredCount ?? 3}`} />
              </div>
              {/* Show document URLs if available */}
              {app.documentVerification && (
                <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(['aadhaar', 'pan', 'salarySlip'] as const).map(dk => {
                    const d = app.documentVerification?.[dk];
                    if (!d?.uploaded) return null;
                    return (
                      <span key={dk} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--accent-green)' }}>
                        <FileCheck2 size={12} /> {dk}
                        {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent-cyan)', marginLeft: 4 }}><Eye size={12} /></a>}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {apps.length === 0 && (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No applications found</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, icon, color, gradient }: { label: string; value: number | string; icon: React.ReactNode; color: string; gradient: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03, y: -4 }} className="glass-card" style={{ padding: 24, background: gradient, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${color}10` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
          <p style={{ margin: '12px 0 0', fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{value}</p>
        </div>
        <span style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', color, background: `${color}1A`, flexShrink: 0 }}>{icon}</span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color }}>
        <ArrowUpRight size={13} /> Live data
      </div>
    </motion.div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.08)' }}>
      <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: '3px 0 0', fontWeight: 700, fontSize: '0.92rem' }}>{value}</p>
    </div>
  );
}
