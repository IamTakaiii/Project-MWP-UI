/**
 * useAuth Hook
 *
 * Centralized authentication state management.
 * Eliminates duplicate auth check logic across pages.
 */

import { useState, useEffect, useCallback } from "react";
import { jiraAuthService } from "@/services/auth.service";

export interface AuthState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  jiraUrl: string;
}

export interface UseAuthReturn extends AuthState {
  setIsAuthenticated: (value: boolean) => void;
  setJiraUrl: (value: string) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * Hook for managing authentication state
 * Automatically checks auth status on mount
 */
export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [jiraUrl, setJiraUrl] = useState("");

  // Check authentication status
  const checkAuth = useCallback(async () => {
    setIsCheckingAuth(true);
    try {
      const session = await jiraAuthService.getCurrentSession();
      setIsAuthenticated(session.authenticated);
      if (session.authenticated && session.jiraUrl) {
        setJiraUrl(session.jiraUrl);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // Refresh session info
  const refreshSession = useCallback(async () => {
    try {
      const session = await jiraAuthService.getCurrentSession();
      setIsAuthenticated(session.authenticated);
      if (session.authenticated && session.jiraUrl) {
        setJiraUrl(session.jiraUrl);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    await jiraAuthService.logout();
    setIsAuthenticated(false);
    setJiraUrl("");
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isCheckingAuth,
    jiraUrl,
    setIsAuthenticated,
    setJiraUrl,
    logout,
    refreshSession,
  };
}
