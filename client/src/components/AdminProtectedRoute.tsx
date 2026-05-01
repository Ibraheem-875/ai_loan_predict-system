import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, adminAuthLoading } = useAdminAuth();
  const location = useLocation();

  if (adminAuthLoading) {
    return (
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        Checking admin authentication...
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
