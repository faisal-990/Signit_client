import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import PDFViewer from '../components/PDFViewer'
import SignatureField from '../components/SignatureField'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'

const signatureFonts = [
  { label: 'Classic', fontFamily: 'cursive' },
  { label: 'Elegant', fontFamily: 'serif' },
  { label: 'Modern', fontFamily: 'monospace' },
  { label: 'Bold', fontFamily: 'sans-serif', fontWeight: 'bold' },
]

function DocumentViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [signatures, setSignatures] = useState([])
  const [pdfError, setPdfError] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [pendingPage, setPendingPage] = useState(1)
  const [pendingName, setPendingName] = useState('')
  const [pendingFont, setPendingFont] = useState(signatureFonts[0])
  const pdfContainerRef = useRef(null)
  const [renderedPdfSize, setRenderedPdfSize] = useState({ width: 600, height: 800 })
  const [showSendModal, setShowSendModal] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [sendStatus, setSendStatus] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoadError('Invalid document ID.');
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}/api/docs/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch document')
        return res.json()
      })
      .then(setDoc)
      .catch(() => setLoadError('Failed to fetch document.'))
    fetch(`${import.meta.env.VITE_API_URL}/api/signatures/${id}`, { credentials: 'include' })
      .then(res => {
        if (res.status === 404) return [];
        if (!res.ok) throw new Error('Failed to fetch signatures');
        return res.json();
      })
      .then(setSignatures)
      .catch(() => setLoadError('Failed to fetch signatures.'))
  }, [id])

  const handleAddSignature = page => {
    setPendingPage(page)
    setPendingName('')
    setPendingFont(signatureFonts[0])
    setShowSignatureModal(true)
  }

  const handleSignatureStyle = () => {
    const newSig = {
      id: uuidv4(),
      document: id,
      x: 100,
      y: 100,
      page: pendingPage,
      style: 'type',
      name: pendingName || 'Sign Here',
      fontFamily: pendingFont.fontFamily,
      fontWeight: pendingFont.fontWeight,
      status: 'pending',
    }
    setSignatures([...signatures, newSig])
    setShowSignatureModal(false)
  }

  const handleDrop = (sig, pos) => {
    setSignatures(signatures.map(s =>
      s.id === sig.id ? { ...s, x: pos.x, y: pos.y } : s
    ))
  }

  const handleSaveSignatures = async () => {
    // Download signed PDF with signatures using pdf-lib
    const pdfBytes = await fetch(`${import.meta.env.VITE_API_URL}${doc.url}`).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const pages = pdfDoc.getPages()
    const renderedWidth = renderedPdfSize.width
    const renderedHeight = renderedPdfSize.height
    signatures.forEach(sig => {
      const page = pages[sig.page - 1]
      if (page) {
        const pdfPageWidth = page.getWidth()
        const pdfPageHeight = page.getHeight()
        // Convert HTML (pixel) coordinates to PDF (point) coordinates
        const pdfX = (sig.x / renderedWidth) * pdfPageWidth
        const pdfY = pdfPageHeight - ((sig.y / renderedHeight) * pdfPageHeight) - 20
        page.drawText(sig.name || 'Sign Here', {
          x: pdfX,
          y: pdfY,
          size: 18,
          font,
          color: rgb(0.9, 0.7, 0.1),
        })
      }
    })
    const signedPdfBytes = await pdfDoc.save()
    const blob = new Blob([signedPdfBytes], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `signed-${doc.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setSignatures(signatures.map(sig => ({ ...sig, status: 'signed' })))
    alert('Signed PDF downloaded!')
  }

  const handleSendForSignature = async () => {
    setSendStatus('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signature-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc._id, recipientEmail }),
      })
      if (!res.ok) throw new Error('Failed to send signature request')
      setSendStatus('success')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      setSendStatus('error')
    }
  }

  if (loadError) return <div className="text-red-600 p-8">{loadError}</div>
  if (!doc) return <div>Loading...</div>

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>Signature request sent successfully!</span>
          </div>
        )}
        <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 flex-1">
          {/* Signature Style Modal */}
          {showSignatureModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col gap-4 border border-blue-100">
                <h3 className="text-lg font-bold mb-2">Create Your Signature</h3>
                <input
                  className="border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-gray-800 placeholder-gray-400 rounded px-3 py-2 mb-2 shadow-sm transition"
                  placeholder="Enter your name"
                  value={pendingName}
                  onChange={e => setPendingName(e.target.value)}
                />
                <div className="flex flex-col gap-2 mb-2">
                  {signatureFonts.map(font => (
                    <button
                      key={font.label}
                      className={`border rounded px-2 py-1 ${pendingFont.label === font.label ? 'bg-blue-100 border-blue-400' : 'border-blue-200'} text-gray-800`}
                      style={{ fontFamily: font.fontFamily, fontWeight: font.fontWeight || 'normal' }}
                      onClick={() => setPendingFont(font)}
                    >
                      {pendingName || 'Sign Here'}
                    </button>
                  ))}
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition" onClick={handleSignatureStyle} disabled={!pendingName}>Add Signature</button>
                <button className="mt-2 text-gray-500 hover:underline" onClick={() => setShowSignatureModal(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div className="flex items-center mb-6 gap-4">
            <button onClick={() => navigate(-1)} className="mr-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">&larr; Back</button>
            <h2 className="text-2xl font-bold text-blue-700">{doc.name}</h2>
            <button
              className="ml-4 bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
              onClick={() => setShowSendModal(true)}
            >
              Send for Signature
            </button>
          </div>
          {/* Send for Signature Modal */}
          {showSendModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col gap-4 border border-blue-100">
                <h3 className="text-lg font-bold mb-2">Send for Signature</h3>
                <input
                  className="border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-gray-800 placeholder-gray-400 rounded px-3 py-2 mb-2 shadow-sm transition"
                  placeholder="Recipient's email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  type="email"
                />
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
                  onClick={handleSendForSignature}
                  disabled={!recipientEmail}
                >
                  Send
                </button>
                <button className="mt-2 text-gray-500 hover:underline" onClick={() => setShowSendModal(false)}>Cancel</button>
                {sendStatus === 'error' && <div className="text-red-600 text-sm mt-2">Failed to send. Please try again.</div>}
              </div>
            </div>
          )}
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-6">
            <button
              className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded font-bold shadow hover:bg-yellow-500 mb-2 md:mb-0"
              onClick={() => handleAddSignature(1)}
            >
              + Add Signature Field
            </button>
            <span className="text-gray-600 text-sm">Drag the yellow box to place your signature. You can add multiple fields.</span>
            <button
              className="ml-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleSaveSignatures}
            >
              Save Signatures
            </button>
          </div>
          <div className="overflow-auto border rounded-xl shadow mb-8 flex justify-center bg-white w-full min-h-[500px]">
            {pdfError ? (
              <div className="text-red-600 p-8">Failed to load PDF file.</div>
            ) : (
              <PDFViewer fileUrl={`${import.meta.env.VITE_API_URL}${doc.url}`} onLoadError={() => setPdfError(true)}>
                {pageNum => (
                  <>
                    {signatures.filter(s => s.page === pageNum).map((sig, idx) => (
                      <SignatureField
                        key={sig.id}
                        x={sig.x}
                        y={sig.y}
                        page={sig.page}
                        isDraggable={true}
                        style={sig.style}
                        name={sig.name}
                        fontFamily={sig.fontFamily}
                        fontWeight={sig.fontWeight}
                        onNameChange={newName => {
                          setSignatures(signatures.map(s => s.id === sig.id ? { ...s, name: newName } : s))
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 w-full flex-1">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Signature Status</h3>
              <ul className="bg-gray-50 rounded p-4 shadow">
                {signatures.map((sig, idx) => (
                  <li key={idx} className="text-sm mb-1">
                    Page {sig.page}: <span className={sig.status === 'signed' ? 'text-green-600' : 'text-yellow-600'}>{sig.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

export default DocumentViewPage 