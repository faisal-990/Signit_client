import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 1. Initialize with a fake user immediately
  const [user, setUser] = useState({
    _id: "demo-user-123",
    displayName: "Demo User",
    email: "demo@example.com",
    photo: "https://ui-avatars.com/api/?name=Demo+User&background=random",
  });

  // 2. Set authenticated to true by default
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  // 3. Disable the server check (we are bypassing auth)
  const refreshUser = async () => {
    // No-op
  };

  const logout = async () => {
    alert("Logout disabled in Demo Mode");
  };

  const handleGoogleLogin = () => {
    alert("Login not required in Demo Mode");
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
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
