import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearStoredAdminToken,
  fetchAdminMe,
  getStoredAdminToken,
  loginAdmin,
  setStoredAdminToken,
  type AuthPayload,
  type AuthUser,
} from '../services/api';

interface AdminAuthContextType {
  admin: AuthUser | null;
  isAdminAuthenticated: boolean;
  adminAuthLoading: boolean;
  loginAdminUser: (payload: AuthPayload) => Promise<void>;
  logoutAdmin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getStoredAdminToken();
      if (!token) {
        setAdminAuthLoading(false);
        return;
      }

      try {
        const me = await fetchAdminMe();
        setAdmin(me.admin);
      } catch {
        clearStoredAdminToken();
        setAdmin(null);
      } finally {
        setAdminAuthLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const loginAdminUser = async (payload: AuthPayload) => {
    const response = await loginAdmin(payload);
    setStoredAdminToken(response.token);
    setAdmin(response.admin);
  };

  const logoutAdmin = () => {
    clearStoredAdminToken();
    setAdmin(null);
  };

  const value = useMemo(
    () => ({
      admin,
      isAdminAuthenticated: Boolean(admin),
      adminAuthLoading,
      loginAdminUser,
      logoutAdmin,
    }),
    [admin, adminAuthLoading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }
  return context;
};
