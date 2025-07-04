import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import DocumentViewPage from './pages/DocumentViewPage'
import NotFoundPage from './pages/NotFoundPage'
import PublicSignPage from './pages/PublicSignPage'
import { useAuth } from './utils/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function App() {
  const { loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/docs/:id" element={<ProtectedRoute><DocumentViewPage /></ProtectedRoute>} />
          <Route path="/sign/:token" element={<PublicSignPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
