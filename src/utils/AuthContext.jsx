import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios"; // 1. Import Axios

const AuthContext = createContext();

// 2. RESTORE THE GLOBAL AXIOS CONFIGURATION
// This ensures all components (like DocumentView) hit the Render Backend, not the Frontend.
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

export function AuthProvider({ children }) {
  // Initialize with the Bypass User immediately
  const [user, setUser] = useState({
    _id: "65e1234567890abcdef12345", // Matches the ID in backend index.js
    displayName: "Demo User",
    email: "demo@example.com",
    photo: "https://ui-avatars.com/api/?name=Demo+User&background=random",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  // We need a dummy token for components that might check for it
  const token = "demo-bypass-token";

  const refreshUser = async () => {
    console.log("Refreshed user (Bypass Mode)");
  };

  const logout = async () => {
    alert("You cannot logout in Demo/Bypass mode.");
  };

  const handleGoogleLogin = () => {
    alert("You are already logged in (Demo Mode).");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // Export the dummy token so components don't crash
        isAuthenticated,
        loading,
        refreshUser,
        logout,
        handleGoogleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
