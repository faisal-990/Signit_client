import React from 'react'
import { Link } from 'react-router-dom'

function statusColor(status) {
  switch (status) {
    case 'signed': return 'bg-green-100 text-green-700 border-green-300'
    case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'rejected': return 'bg-red-100 text-red-700 border-red-300'
    default: return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

function DocumentCard({ doc }) {
  return (
    <div className="flex flex-col items-start justify-between bg-white rounded-2xl shadow-lg p-6 transition-transform hover:-translate-y-1 hover:shadow-2xl border border-blue-50 min-h-[170px]">
      <div className="w-full flex flex-col gap-1">
        <h3 className="text-lg font-bold text-gray-800 truncate">{doc.name}</h3>
        <div className="text-xs text-gray-400">Uploaded: {doc.uploadedAt}</div>
        <span className={`inline-block mt-3 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${statusColor(doc.status)}`}>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
      </div>
      <div className="flex gap-2 mt-6 w-full">
        <Link to={`/docs/${doc._id}`} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-full font-semibold shadow hover:bg-blue-600 transition-all text-center">View</Link>
      </div>
    </div>
  )
}

export default DocumentCard 