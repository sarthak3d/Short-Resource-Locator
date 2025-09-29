'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth as authApi, user as userApi, analyticsToken as analyticsTokenApi } from '@/app/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('srl_token');
    if (!token) {
      setAuthState({ isAuthenticated: false, isLoading: false, user: null });
      return;
    }
    try {
      const details = await userApi.getDetails();
      setAuthState({ isAuthenticated: true, isLoading: false, user: details });
    } catch {
      localStorage.removeItem('srl_token');
      localStorage.removeItem('srl_analytics_token');
      setAuthState({ isAuthenticated: false, isLoading: false, user: null });
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = useCallback(async (identifier, passcode) => {
    const data = await authApi.login(identifier, passcode);
    const token = data.token || data.message || data;
    if (typeof token === 'string' && token.length > 20) {
      localStorage.setItem('srl_token', token);
      localStorage.removeItem('srl_analytics_token');
    }
    await loadUser();
    return data;
  }, [loadUser]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* server might be down */ }
    localStorage.removeItem('srl_token');
    localStorage.removeItem('srl_analytics_token');
    setAuthState({ isAuthenticated: false, isLoading: false, user: null });
  }, []);

  const fetchingRef = useRef(false);

  const fetchAnalyticsToken = useCallback(async () => {
    const existing = localStorage.getItem('srl_analytics_token');
    if (existing) return existing;

    if (fetchingRef.current) return null;
    fetchingRef.current = true;

    try {
      const data = await analyticsTokenApi.get();
      const token = data.analyticsToken || data.token || data.message || (typeof data === 'string' ? data : null);
      if (typeof token === 'string' && token.length > 20) {
        localStorage.setItem('srl_analytics_token', token);
        return token;
      }
      return null;
    } catch (err) {
      localStorage.removeItem('srl_analytics_token');
      throw err;
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const clearAnalyticsToken = useCallback(() => {
    localStorage.removeItem('srl_analytics_token');
  }, []);

  const refreshUser = loadUser;

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      refreshUser,
      fetchAnalyticsToken,
      clearAnalyticsToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
