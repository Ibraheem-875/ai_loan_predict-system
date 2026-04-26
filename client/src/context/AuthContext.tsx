import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearStoredToken,
  fetchMe,
  getStoredToken,
  loginUser,
  registerUser,
  setStoredToken,
  type AuthPayload,
  type AuthUser,
  type RegisterPayload,
} from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (payload: AuthPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getStoredToken();
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const me = await fetchMe();
        setUser(me.user);
      } catch {
        clearStoredToken();
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = async (payload: AuthPayload) => {
    const response = await loginUser(payload);
    setStoredToken(response.token);
    setUser(response.user);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await registerUser(payload);
    setStoredToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authLoading,
      login,
      register,
      logout,
    }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
