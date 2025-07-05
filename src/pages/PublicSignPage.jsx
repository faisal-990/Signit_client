import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import PDFViewer from '../components/PDFViewer'
import SignatureField from '../components/SignatureField'
import { useAuth } from '../utils/AuthContext'

function PublicSignPage() {
  const { token: urlToken } = useParams()
  const [request, setRequest] = useState(null)
  const [signatures, setSignatures] = useState([])
  const [pdfError, setPdfError] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [signed, setSigned] = useState(false)
  const pdfContainerRef = useRef(null)
  const [renderedPdfSize, setRenderedPdfSize] = useState({ width: 600, height: 800 })
  const { token } = useAuth()

  useEffect(() => {
    if (!token) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/signature-request/${urlToken}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setLoadError(data.error)
        else setRequest(data)
      })
      .catch(() => setLoadError('Failed to load signature request.'))
  }, [urlToken, token])

  const handleAddSignature = page => {
    setSignatures([{ x: 100, y: 100, page, name: 'Sign Here' }])
  }

  const handleDrop = (sig, pos) => {
    setSignatures(signatures.map(s => s === sig ? { ...s, x: pos.x, y: pos.y } : s))
  }

  const handleSaveSignature = async () => {
    if (!token) return;
    // Convert to PDF coordinates
    const pdfBytes = await fetch(`${import.meta.env.VITE_API_URL}${request.document.url}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.arrayBuffer())
    const { width: renderedWidth, height: renderedHeight } = renderedPdfSize
    const pdfDoc = await window.pdfLib.PDFDocument.load(pdfBytes)
    const font = await pdfDoc.embedFont(window.pdfLib.StandardFonts.HelveticaBold)
    const pages = pdfDoc.getPages()
    signatures.forEach(sig => {
      const page = pages[sig.page - 1]
      if (page) {
        const pdfPageWidth = page.getWidth()
        const pdfPageHeight = page.getHeight()
        const pdfX = (sig.x / renderedWidth) * pdfPageWidth
        const pdfY = pdfPageHeight - ((sig.y / renderedHeight) * pdfPageHeight) - 20
        page.drawText(sig.name || 'Sign Here', {
          x: pdfX,
          y: pdfY,
          size: 18,
          font,
          color: window.pdfLib.rgb(0.9, 0.7, 0.1),
        })
      }
    })
    const signedPdfBytes = await pdfDoc.save()
    // Submit to backend
    await fetch(`${import.meta.env.VITE_API_URL}/api/signature-request/${urlToken}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ signatureData: { signatures } }),
    })
    setSigned(true)
    // Optionally, trigger download
    const blob = new Blob([signedPdfBytes], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `signed-document.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loadError) return <div className="text-red-600 p-8">{loadError}</div>
  if (!request) return <div>Loading...</div>
  if (signed) return <div className="text-green-600 p-8">Thank you! Document signed.</div>

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-2 py-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 md:p-10 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Sign Document</h2>
        <div className="mb-4">Recipient: <span className="font-semibold">{request.recipientEmail}</span></div>
        <div className="overflow-auto border rounded-xl shadow mb-8 flex justify-center bg-white w-full min-h-[500px]">
          {pdfError ? (
            <div className="text-red-600 p-8">Failed to load PDF file.</div>
          ) : (
            <PDFViewer fileUrl={`${import.meta.env.VITE_API_URL}${request.document.url}`} onLoadError={() => setPdfError(true)}>
              {pageNum => (
                <>
                  {signatures.filter(s => s.page === pageNum).map((sig, idx) => (
                    <SignatureField
                      key={idx}
                      x={sig.x}
                      y={sig.y}
                      page={sig.page}
                      isDraggable={true}
                      style="type"
                      name={sig.name}
                      onNameChange={newName => {
                        setSignatures(signatures.map((s, i) => i === idx ? { ...s, name: newName } : s))
                      }}
                      onDrop={(item, pos) => handleDrop(sig, pos)}
                    >
                      {sig.name || 'Sign Here'}
                    </SignatureField>
                  ))}
                </>
              )}
            </PDFViewer>
          )}
        </div>
        <button
          className="bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-full font-bold shadow-sm hover:bg-blue-50 hover:border-blue-400 transition mb-2 flex items-center gap-2"
          onClick={() => handleAddSignature(1)}
        >
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Signature Field
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-blue-600 transition"
          onClick={handleSaveSignature}
          disabled={signatures.length === 0}
        >
          Submit Signature
        </button>
      </div>
    </div>
  )
}

export default PublicSignPage 