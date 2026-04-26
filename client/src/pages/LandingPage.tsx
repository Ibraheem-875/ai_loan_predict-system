import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, BarChart3, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-container"
    >
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '64px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: 'var(--accent-green)', 
            padding: '8px 16px', 
            borderRadius: 100,
            marginBottom: 24,
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <Zap size={16} /> FinCore AI Engine 3.0 Live
        </motion.div>
        
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 24 }}>
          AI-Powered Loan Decisions <br />
          <span className="gradient-text">In Seconds.</span>
        </h1>
        
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', maxWidth: 700, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Experience the future of financial lending. Our advanced AI analyzes your profile, predicts approval probabilities, and provides actionable insights to improve your score.
        </p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
          style={{ fontSize: '1.1rem', padding: '16px 32px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}
          onClick={() => navigate(isAuthenticated ? '/analyze' : '/auth')}
        >
          {isAuthenticated ? 'Start Assessment' : 'Login to Start'} <ArrowRight size={20} />
        </motion.button>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '64px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <FeatureCard 
            icon={<ShieldCheck size={32} color="var(--accent-green)" />}
            title="Smart Risk Assessment"
            desc="Our proprietary algorithm evaluates multiple data points to give you a highly accurate risk profile and probability score."
            delay={0.1}
          />
          <FeatureCard 
            icon={<BarChart3 size={32} color="var(--accent-blue)" />}
            title="Interactive Visuals"
            desc="Understand your EMI structure and credit metrics through beautiful, interactive charts and gauge components."
            delay={0.2}
          />
          <FeatureCard 
            icon={<FileText size={32} color="#f59e0b" />}
            title="Instant PDF Reports"
            desc="Download a comprehensive, professional-grade loan analysis report with one click for your records."
            delay={0.3}
          />
        </div>
      </section>

      {/* Trust Banner */}
      <section className="glass-card" style={{ margin: '64px 20px', padding: 48, textAlign: 'center', borderRadius: 24 }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 16 }}>Ready to take control of your finances?</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
          Join thousands of users who have successfully optimized their loan applications using FinCore AI.
        </p>
        <button className="btn-secondary" onClick={() => navigate(isAuthenticated ? '/analyze' : '/auth')}>
          {isAuthenticated ? 'Try Analyzer Now' : 'Login & Try Analyzer'}
        </button>
      </section>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="glass-card" 
      style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div style={{ 
        width: 64, height: 64, borderRadius: 16, 
        background: 'rgba(255, 255, 255, 0.05)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </motion.div>
  );
}
