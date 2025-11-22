import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// 1. Set the worker source explicitly to a CDN (Most reliable for demos)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PDFViewer({ fileUrl, children, onLoadError }) {
  const [numPages, setNumPages] = useState(null);

  return (
    <div className="relative w-full flex justify-center bg-gray-100 p-4">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(err) => {
          console.error("PDF Load Error:", err);
          if (onLoadError) onLoadError(err);
        }}
        className="mx-auto shadow-lg"
      >
        {/* Render only first 5 pages for performance in demo */}
        {Array.from(new Array(numPages || 0), (el, idx) => (
          <div key={idx} className="relative mb-4 shadow-md">
            {/* Important: Set a fixed width or responsive scale */}
            <Page
              pageNumber={idx + 1}
              width={600}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
            {children && children(idx + 1)}
          </div>
        ))}
      </Document>
    </div>
  );
}

export default PDFViewer;

