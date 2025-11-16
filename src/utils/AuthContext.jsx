import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios"; // Make sure this is imported

const AuthContext = createContext();

// --- THIS IS THE FIX ---
// Set the default axios settings
// This tells axios to use your Render URL as the base
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
// This tells axios to SEND THE COOKIE on every request
axios.defaults.withCredentials = true;
// ----------------------

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      // This request will now automatically include the cookie
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
    // Redirect to the backend for Google login
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
      {/* Only render children when loading is false */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
