import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStoredAuth,
  getStoredAuth,
  onUnauthorized,
  setStoredAuth,
} from "../api/apiClient";
import { fetchMe, login as loginRequest, logout as logoutRequest } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const stored = getStoredAuth();
  const [user, setUser] = useState(stored?.user || null);
  const [token, setToken] = useState(stored?.token || null);
  const [checkingSession, setCheckingSession] = useState(Boolean(stored?.token));

  const applyAuth = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    setStoredAuth({ user: nextUser, token: nextToken, loggedAt: new Date().toISOString() });
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
  }, []);

  useEffect(() => onUnauthorized(() => clearAuth()), [clearAuth]);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setCheckingSession(false);
      return;
    }
    fetchMe()
      .then((freshUser) => {
        if (!cancelled) {
          setUser(freshUser);
          setStoredAuth({ user: freshUser, token, loggedAt: new Date().toISOString() });
        }
      })
      .catch(() => {
        if (!cancelled) clearAuth();
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (username, password) => {
      const result = await loginRequest(username, password);
      applyAuth(result.user, result.token);
      return result;
    },
    [applyAuth]
  );

  const logout = useCallback(async () => {
    try {
      if (token) await logoutRequest();
    } catch {
      
    } finally {
      clearAuth();
    }
  }, [token, clearAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      checkingSession,
      login,
      logout,
      setUser,
    }),
    [user, token, checkingSession, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  return ctx;
}
