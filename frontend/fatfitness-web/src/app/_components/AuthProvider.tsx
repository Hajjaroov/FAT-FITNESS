"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAuthSession,
} from "@/lib/api";
import type { CurrentUser, LoginRequest } from "@/types/auth";

type AuthStatus = "checking" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  user: CurrentUser | null;
  accessToken: string | null;
  login: (request: LoginRequest) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<CurrentUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  async function applyAccessToken(nextAccessToken: string) {
    const currentUser = await getCurrentUser(nextAccessToken);

    setAccessToken(nextAccessToken);
    setUser(currentUser);
    setStatus("authenticated");

    return currentUser;
  }

  async function refreshSession() {
    try {
      const response = await refreshAuthSession();
      return applyAccessToken(response.accessToken);
    } catch {
      setAccessToken(null);
      setUser(null);
      setStatus("anonymous");
      return null;
    }
  }

  async function login(request: LoginRequest) {
    const response = await loginUser(request);
    return applyAccessToken(response.accessToken);
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus("anonymous");
    }
  }

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      try {
        const response = await refreshAuthSession();
        const currentUser = await getCurrentUser(response.accessToken);

        if (!isActive) {
          return;
        }

        setAccessToken(response.accessToken);
        setUser(currentUser);
        setStatus("authenticated");
      } catch {
        if (!isActive) {
          return;
        }

        setAccessToken(null);
        setUser(null);
        setStatus("anonymous");
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <AuthContext
      value={{
        status,
        user,
        accessToken,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
