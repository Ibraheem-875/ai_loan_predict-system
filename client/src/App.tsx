import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 64px', width: '100%', flex: 1 }}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/analyze"
                element={(
                  <ProtectedRoute>
                    <AnalyzePage />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/history"
                element={(
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/admin"
                element={(
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                )}
              />
            </Routes>
          </AnimatePresence>
        </main>

        <footer style={{ textAlign: 'center', marginTop: 'auto', padding: '32px 20px', borderTop: '1px solid var(--border-glass)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Built with React, Express & MongoDB — Loan Eligibility Prediction System © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
 
