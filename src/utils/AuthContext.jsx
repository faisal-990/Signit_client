// utils/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Set the default for axios (or use fetch with credentials)
// This is the most important part
import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true; // This sends the cookie with every request

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      // The withCredentials=true setting makes this request work
      const res = await axios.get("/api/auth/me");

      if (res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // On initial load, check if we're already logged in (via the cookie)
  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    // Tell the backend to destroy the session/cookie
    await axios.get("/api/auth/logout");
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleGoogleLogin = () => {
    // Just redirect to the backend. The backend will handle the rest
    // and redirect back to the CLIENT_URL (which reloads this app)
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        refreshUser,
        logout,
        handleGoogleLogin,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

