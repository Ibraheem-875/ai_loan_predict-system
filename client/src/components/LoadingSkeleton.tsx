/**
 * Skeleton loading placeholders matching the dashboard layout.
 */
export default function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Eligibility skeleton */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div className="skeleton" style={{ width: '60%', height: 24, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '40%', height: 16, marginBottom: 20 }} />
        <div className="skeleton" style={{ width: '100%', height: 10, borderRadius: 5 }} />
      </div>

      {/* EMI cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 10, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: '50%', height: 12, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: '70%', height: 18 }} />
          </div>
        ))}
      </div>

      {/* Risk skeleton */}
      <div className="glass-card" style={{ padding: 24, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: '40%', height: 18, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '80%', height: 14 }} />
        </div>
      </div>

      {/* Charts skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="skeleton" style={{ width: '40%', height: 16, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: '100%', height: 200 }} />
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="skeleton" style={{ width: '40%', height: 16, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: '100%', height: 200 }} />
        </div>
      </div>
    </div>
  );
}
 