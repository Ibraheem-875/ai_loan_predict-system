import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectPath = useMemo(() => {
    const from = location.state as { from?: string } | null;
    return from?.from || '/analyze';
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/analyze', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        await register({ name: name.trim(), email: email.trim(), password });
      } else {
        await login({ email: email.trim(), password });
      }
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Authentication failed. Please try again.');
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
            {mode === 'login' ? 'Login to ' : 'Create '}<span className="gradient-text">FinCore AI</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            {mode === 'login' ? 'Continue to analyze and track applications.' : 'Create your account to start loan analysis.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <button
            type="button"
            className={mode === 'login' ? 'btn-primary' : 'btn-secondary'}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
            onClick={() => setMode('login')}
          >
            <LogIn size={16} /> Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'btn-primary' : 'btn-secondary'}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
            onClick={() => setMode('register')}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              style={inputStyle}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
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
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
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
