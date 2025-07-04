import React from 'react'

function CenteredLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-2 py-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 md:p-12 flex flex-col gap-8 items-center">
        {children}
      </div>
    </div>
  )
}

export default CenteredLayout 