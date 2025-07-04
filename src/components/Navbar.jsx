import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

function getUserDisplayName(user) {
  if (!user) return 'User';
  if (user.displayName) {
    const parts = user.displayName.trim().split(' ');
    if (parts.length > 1) return parts[parts.length - 1]; // Last name
    return parts[0]; // Fallback to first name
  }
  if (user.name) {
    const parts = user.name.trim().split(' ');
    if (parts.length > 1) return parts[parts.length - 1];
    return parts[0];
  }
  return 'User';
}

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-blue-100 shadow-sm mb-6">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-blue-600 font-sans">SignIt</Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700 font-medium bg-blue-50 rounded-full px-3 py-1 text-sm">
                {getUserDisplayName(user)}
              </span>
              <button onClick={handleLogout} className="px-4 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition-all font-semibold">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-500 hover:underline font-semibold">Login</Link>
              <Link to="/register" className="text-blue-500 hover:underline font-semibold">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar 