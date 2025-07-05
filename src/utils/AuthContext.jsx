import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token') || null)

  // Helper to set token in state and localStorage
  const saveToken = (jwt) => {
    setToken(jwt)
    if (jwt) localStorage.setItem('jwt_token', jwt)
    else localStorage.removeItem('jwt_token')
  }

  // Check for token in URL (after Google login)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const jwt = params.get('token')
    if (jwt) {
      saveToken(jwt)
      window.history.replaceState({}, document.title, window.location.pathname) // Clean up URL
    }
  }, [])

  // Fetch user info with JWT
  const refreshUser = async () => {
    setLoading(true)
    try {
      if (!token) throw new Error('No token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
        saveToken(null)
      }
    } catch {
      setUser(null)
      setIsAuthenticated(false)
      saveToken(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) refreshUser()
    else {
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
    }
    // eslint-disable-next-line
  }, [token])

  const logout = () => {
    saveToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, refreshUser, logout, handleGoogleLogin, token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
} 