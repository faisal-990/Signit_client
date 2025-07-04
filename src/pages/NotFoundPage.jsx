import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

function NotFoundPage() {
  const { isAuthenticated } = useAuth()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-lg text-center">
        <h2 className="text-4xl font-bold mb-4 text-blue-700">404 - Not Found</h2>
        <p className="text-gray-500 mb-6">The page you are looking for does not exist.</p>
        <Link
          to={isAuthenticated ? '/' : '/login'}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage 