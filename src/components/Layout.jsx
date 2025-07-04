import React from 'react'

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 flex-1">
        {children}
      </div>
    </div>
  )
}

export default AppLayout 