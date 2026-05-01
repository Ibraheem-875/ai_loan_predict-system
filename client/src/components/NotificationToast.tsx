import { CheckCircle2, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  message: string;
  tone?: 'success' | 'info';
  onClose: () => void;
}

export default function NotificationToast({ message, tone = 'info', onClose }: Props) {
  const color = tone === 'success' ? 'var(--accent-green)' : 'var(--accent-blue)';

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      style={{
        position: 'fixed',
        top: 88,
        right: 24,
        zIndex: 100,
        minWidth: 260,
        maxWidth: 360,
        padding: 16,
        borderRadius: 12,
        border: `1px solid ${color}55`,
        background: 'var(--bg-secondary)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {tone === 'success' ? <CheckCircle2 size={20} color={color} /> : <Info size={20} color={color} />}
      <p style={{ flex: 1, margin: 0, fontWeight: 700 }}>{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          border: '1px solid var(--border-glass)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <X size={15} />
      </button>
    </motion.div>
  );
}
