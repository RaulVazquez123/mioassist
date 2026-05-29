// src/lib/AuthContext.jsx
// Sin base44 — solo localStorage

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSession, logout as doLogout } from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(undefined);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const session = getSession();
    setUser(session || null);
    setIsLoadingAuth(false);
  }, []);

  const login = (userData) => setUser(userData);

  const logout = () => {
    doLogout();
    setUser(null);
  };

  const refreshUser = () => {
    const session = getSession();
    if (session) setUser(session);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      login,
      logout,
      refreshUser,
      navigateToLogin: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}