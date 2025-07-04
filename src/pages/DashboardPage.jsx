import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DocumentCard from '../components/DocumentCard'
import UploadPDF from '../components/UploadPDF'

const statusOptions = ['all', 'pending', 'signed', 'rejected']

function DashboardPage() {
  const [docs, setDocs] = useState([])
  const [filter, setFilter] = useState('all')
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/docs`, { credentials: 'include' })
      .then(res => res.json())
      .then(setDocs)
  }, [])

  const handleUpload = async (docData) => {
    setUploading(true)
    console.log('handleUpload docData:', docData);
    setDocs([docData, ...docs])
    setUploading(false)
    navigate(`/docs/${docData._id}`)
  }

  const filteredDocs = filter === 'all' ? docs : docs.filter(d => d.status === filter)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 flex-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold">Your Documents</h2>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1 rounded ${filter === opt ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8 bg-white rounded-xl shadow p-6 w-full">
          <UploadPDF onUpload={handleUpload} />
          {uploading && <div className="text-blue-600 text-sm mt-2">Uploading...</div>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full flex-1">
          {filteredDocs.length === 0 ? (
            <div className="text-gray-500 col-span-full">No documents found.</div>
          ) : (
            filteredDocs.map(doc => <DocumentCard key={doc._id} doc={doc} />)
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage 