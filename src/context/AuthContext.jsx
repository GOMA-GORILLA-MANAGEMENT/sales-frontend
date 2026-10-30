import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "../utils/toast";
import { API_BASE_URL } from "../config/api";
import { api, clearSession } from "../lib/http";

export const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const me = await api.get("/api/me");
    localStorage.setItem("user", JSON.stringify(me));
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    loadMe()
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [loadMe]);

  /** Stores the tokens, then loads who this person is and what they may do. */
  const login = async (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    return loadMe();
  };

  const logout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        });
      } catch {
        /* the session is cleared below either way */
      }
    }
    clearSession();
    setUser(null);
    toast.success("You have been signed out.");
  };

  const can = (permission) => !!user && user.permissions?.includes(permission);

  const isAuthenticated = () => !!user && !!localStorage.getItem("accessToken");

  const value = { user, login, logout, can, reload: loadMe, isAuthenticated, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
