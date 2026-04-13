import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fintrack_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('fintrack_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          localStorage.setItem('fintrack_user', JSON.stringify(res.data.user));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    verify();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('fintrack_token', t);
    localStorage.setItem('fintrack_user', JSON.stringify(u));
    return u;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('fintrack_token', t);
    localStorage.setItem('fintrack_user', JSON.stringify(u));
    return u;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
