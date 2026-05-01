import { useState } from 'react';
import { Sun, Moon, Shield, Home, Activity, Clock, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={16} /> },
    ...(isAuthenticated
      ? [
          { name: 'Analyze', path: '/analyze', icon: <Activity size={16} /> },
          { name: 'History', path: '/history', icon: <Clock size={16} /> },
          { name: 'Admin', path: '/admin', icon: <LayoutDashboard size={16} /> },
        ]
      : []),
  ];

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-glass)',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }} className="gradient-text">
            Loan Eligibility Prediction System 
          </h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
            Loan Assessment
          </p>
        </div>
      </Link>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.02)', padding: 6, borderRadius: 16, border: '1px solid var(--border-glass)' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                style={{ 
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 6, 
                  padding: '8px 16px', borderRadius: 10, 
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
                  transition: 'color 0.2s'
                }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill"
                    style={{ position: 'absolute', inset: 0, background: 'var(--gradient-primary)', borderRadius: 10, zIndex: -1 }}
                  />
                )}
                <span style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {link.icon} {link.name}
                </span>
              </Link>
            );
          })}
        </div>

        {!isAuthenticated ? (
          <Link
            to="/auth"
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '10px 14px' }}
          >
            <LogIn size={16} /> Login
          </Link>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}
          >
            <LogOut size={16} /> {user?.name ? `Logout (${user.name.split(' ')[0]})` : 'Logout'}
          </button>
        )}

        <button
          onClick={toggleTheme}
          style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid var(--border-glass)', background: 'var(--bg-glass)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}
 
