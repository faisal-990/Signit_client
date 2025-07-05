import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext'
import './index.css'
import App from './App.jsx'
import PublicSignPage from './pages/PublicSignPage.jsx'
import * as pdfLib from 'pdf-lib'

// Debug: Log the API URL to see what's being used
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

window.pdfLib = pdfLib

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
