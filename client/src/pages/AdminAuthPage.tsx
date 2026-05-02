import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, LogIn } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminAuthPage() {
  const { loginAdminUser, isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectPath = useMemo(() => {
    const from = location.state as { from?: string } | null;
    return from?.from || '/admin';
  }, [location.state]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginAdminUser({ email: email.trim(), password });
      navigate(redirectPath, { replace: true });
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string; error?: string } } };
      setError(errorResponse.response?.data?.message || errorResponse.response?.data?.error || 'Admin authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="page-container"
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: 520, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
            Admin Login <span className="gradient-text">Account</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            Sign in to access admin metrics and controls.
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <button type="button" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <LogIn size={16} /> Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            required
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            style={inputStyle}
          />

          {error && (
            <div className="glass-card" style={{ padding: 12, borderLeft: '3px solid var(--accent-red)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle size={16} color="var(--accent-red)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{error}</span>
            </div>
          )}

          <button disabled={loading} type="submit" className="btn-primary" style={{ marginTop: 8 }}>
            {loading ? 'Please wait...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--border-glass)',
  background: 'var(--bg-glass)',
  color: 'var(--text-primary)',
  outline: 'none',
};
