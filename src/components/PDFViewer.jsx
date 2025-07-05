import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

// For react-pdf v10, the worker is handled automatically
// No need to manually set workerSrc

function PDFViewer({ fileUrl, children, onLoadError }) {
  const [numPages, setNumPages] = useState(null)

  // Debug: log the fileUrl
  console.log('PDFViewer fileUrl:', fileUrl)

  return (
    <div className="relative w-full flex justify-center">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={onLoadError}
        className="mx-auto"
      >
        {Array.from(new Array(numPages), (el, idx) => (
          <div key={idx} className="relative">
            <Page pageNumber={idx + 1} width={600} />
            {children && children(idx + 1)}
          </div>
        ))}
      </Document>
    </div>
  )
}

export default PDFViewer 