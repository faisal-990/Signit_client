import React, { useRef, useState } from 'react'
import { useAuth } from '../utils/AuthContext'

function UploadPDF({ onUpload }) {
  const fileInput = useRef()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const { token } = useAuth()

  const handleFileChange = async e => {
    const file = e.target.files[0]
    setError('')
    if (file && file.type === 'application/pdf') {
      setLoading(true)
      const formData = new FormData()
      formData.append('pdf', file)
      try {
        // 1. Upload the PDF file
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/pdf`, {
          method: 'POST',
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (!uploadRes.ok) throw new Error('Upload failed')
        const uploadData = await uploadRes.json()
        // 2. Save document metadata to backend
        const docRes = await fetch(`${import.meta.env.VITE_API_URL}/api/docs/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ name: file.name, url: uploadData.url }),
        })
        if (!docRes.ok) throw new Error('Failed to save document metadata')
        const docData = await docRes.json()
        if (docData && docData._id) {
          onUpload(docData)
        } else {
          setError('Failed to get document ID after upload. Please try again.')
        }
      } catch (err) {
        setError('Failed to upload PDF. Please try again.')
      } finally {
        setLoading(false)
        fileInput.current.value = ''
      }
    } else {
      setError('Please select a valid PDF file.')
    }
  }

  const handleDragOver = e => {
    e.preventDefault()
    setDragActive(true)
  }
  const handleDragLeave = e => {
    e.preventDefault()
    setDragActive(false)
  }
  const handleDrop = e => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInput.current.files = e.dataTransfer.files
      handleFileChange({ target: { files: e.dataTransfer.files } })
    }
  }

  return (
    <div className="mb-6">
      <label className="block mb-2 font-semibold text-gray-700">Upload PDF</label>
      <div
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-blue-200 bg-white hover:border-blue-400'}`}
        onClick={() => fileInput.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg className="w-12 h-12 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-4 4m4-4l4 4M20 16.24V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.76a2 2 0 01.553-1.387l7-7a2 2 0 012.894 0l7 7A2 2 0 0120 16.24z" />
        </svg>
        <span className="text-blue-500 font-medium">Drag & drop your PDF here, or <span className="underline">browse</span></span>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInput}
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />
      </div>
      {loading && <div className="text-blue-600 text-sm mt-2">Uploading...</div>}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  )
}

export default UploadPDF 