import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from './api-client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMe = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/auth/me');
      setUser(res.data?.user || null);
      setPermissions(res.data?.permissions || []);
      setError(null);
      return res.data?.user;
    } catch {
      setUser(null);
      setPermissions([]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password, rememberMe = false) => {
    const res = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
    setUser(res.data?.user || null);
    setPermissions(res.data?.permissions || []);
    return res.data?.user;
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      /* ignore logout API error and clear local state */
    }
    setUser(null);
    setPermissions([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        error,
        login,
        logout,
        refetchMe: fetchMe,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
