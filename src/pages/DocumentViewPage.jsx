import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PDFViewer from "../components/PDFViewer";
import SignatureField from "../components/SignatureField";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../utils/AuthContext";
import axios from "axios"; // Make sure axios is imported

const signatureFonts = [
  { label: "Classic", fontFamily: "cursive" },
  { label: "Elegant", fontFamily: "serif" },
  { label: "Modern", fontFamily: "monospace" },
  { label: "Bold", fontFamily: "sans-serif", fontWeight: "bold" },
];

function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null); // <--- NEW: Store Blob URL
  const [signatures, setSignatures] = useState([]);
  const [pdfError, setPdfError] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingName, setPendingName] = useState("");
  const [pendingFont, setPendingFont] = useState(signatureFonts[0]);
  const [renderedPdfSize, setRenderedPdfSize] = useState({
    width: 600,
    height: 800,
  });
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { token, user } = useAuth(); // Get user from context

  // 1. Fetch Document Metadata
  useEffect(() => {
    if (!id) return;

    const fetchDoc = async () => {
      try {
        const res = await axios.get(`/api/docs/${id}`);
        setDoc(res.data);
      } catch (err) {
        console.error("Doc fetch error:", err);
        setLoadError("Failed to fetch document details.");
      }
    };

    const fetchSignatures = async () => {
      try {
        const res = await axios.get(`/api/signatures/${id}`);
        setSignatures(res.data || []);
      } catch (err) {
        // Ignore 404 for empty signatures
      }
    };

    fetchDoc();
    fetchSignatures();
  }, [id]);

  // 2. Fetch PDF File as Blob (Solves CORS/Auth for Preview)
  useEffect(() => {
    if (!doc?.url) return;

    const fetchPdfBlob = async () => {
      try {
        // We fetch the file using axios (which has the Auth cookie/header)
        // responseType: 'blob' is critical here
        const res = await axios.get(doc.url, { responseType: "blob" });

        // Create a local URL for the browser to use
        const blobUrl = URL.createObjectURL(res.data);
        setPdfBlobUrl(blobUrl);
      } catch (err) {
        console.error("PDF Blob fetch error:", err);
        setPdfError(true);
      }
    };

    fetchPdfBlob();

    // Cleanup URL on unmount to avoid memory leaks
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [doc]);

  const handleAddSignature = (page) => {
    setPendingPage(page);
    setPendingName("");
    setPendingFont(signatureFonts[0]);
    setShowSignatureModal(true);
  };

  const handleSignatureStyle = () => {
    const newSig = {
      id: uuidv4(),
      document: id,
      x: 100,
      y: 100,
      page: pendingPage,
      style: "type",
      name: pendingName || "Sign Here",
      fontFamily: pendingFont.fontFamily,
      fontWeight: pendingFont.fontWeight,
      status: "pending",
    };
    setSignatures([...signatures, newSig]);
    setShowSignatureModal(false);
  };

  const handleDrop = (sig, pos) => {
    setSignatures(
      signatures.map((s) =>
        s.id === sig.id ? { ...s, x: pos.x, y: pos.y } : s,
      ),
    );
  };

  const handleSaveSignatures = async () => {
    if (!pdfBlobUrl) return;

    // Load the PDF from the Blob URL we already have
    const existingPdfBytes = await fetch(pdfBlobUrl).then((res) =>
      res.arrayBuffer(),
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();
    const renderedWidth = renderedPdfSize.width;
    const renderedHeight = renderedPdfSize.height;

    signatures.forEach((sig) => {
      const page = pages[sig.page - 1];
      if (page) {
        const pdfPageWidth = page.getWidth();
        const pdfPageHeight = page.getHeight();
        const pdfX = (sig.x / renderedWidth) * pdfPageWidth;
        const pdfY =
          pdfPageHeight - (sig.y / renderedHeight) * pdfPageHeight - 20;

        page.drawText(sig.name || "Sign Here", {
          x: pdfX,
          y: pdfY,
          size: 18,
          font,
          color: rgb(0.9, 0.7, 0.1),
        });
      }
    });

    const signedPdfBytes = await pdfDoc.save();
    const blob = new Blob([signedPdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `signed-${doc.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSignatures(signatures.map((sig) => ({ ...sig, status: "signed" })));
    alert("Signed PDF downloaded!");
  };

  const handleSendForSignature = async () => {
    setSendStatus("");
    try {
      await axios.post("/api/signature-request", {
        documentId: doc._id,
        recipientEmail,
      });

      setSendStatus("success");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setSendStatus("error");
    }
  };

  if (loadError) return <div className="text-red-600 p-8">{loadError}</div>;
  if (!doc) return <div className="p-8">Loading document...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showSuccess && (
          <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <span>Signature request sent! (Check Server Logs for Link)</span>
          </div>
        )}

        <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 flex-1">
          {/* ... (Keep Modal code exactly as is) ... */}
          {showSignatureModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col gap-4 border border-blue-100">
                {/* ... Modal Content ... */}
                <h3 className="text-lg font-bold mb-2">
                  Create Your Signature
                </h3>
                <input
                  className="border p-2 rounded"
                  value={pendingName}
                  onChange={(e) => setPendingName(e.target.value)}
                />
                <button
                  onClick={handleSignatureStyle}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Send Modal */}
          {showSendModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col gap-4 border border-blue-100">
                <h3 className="text-lg font-bold">Send for Signature</h3>
                <p className="text-xs text-gray-500">
                  Note: If email fails, check backend logs for the link.
                </p>
                <input
                  className="border p-2 rounded w-full"
                  placeholder="Recipient Email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
                <button
                  onClick={handleSendForSignature}
                  className="bg-green-500 text-white p-2 rounded mt-2"
                >
                  Send
                </button>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-gray-500 mt-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-blue-700">{doc.name}</h2>
            <button
              onClick={() => setShowSendModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Send for Signature
            </button>
          </div>

          {/* PDF Viewer Area */}
          <div className="overflow-auto border rounded-xl shadow mb-8 flex justify-center bg-white w-full min-h-[500px]">
            {pdfError ? (
              <div className="text-red-600 p-8">Failed to load PDF file.</div>
            ) : !pdfBlobUrl ? (
              <div className="p-8 text-gray-500">Loading PDF...</div>
            ) : (
              <PDFViewer
                fileUrl={pdfBlobUrl}
                onLoadError={() => setPdfError(true)}
              >
                {(pageNum) => (
                  <>
                    {signatures
                      .filter((s) => s.page === pageNum)
                      .map((sig) => (
                        <SignatureField
                          key={sig.id}
                          x={sig.x}
                          y={sig.y}
                          page={sig.page}
                          isDraggable={true}
                          name={sig.name}
                          onDrop={(item, pos) => handleDrop(sig, pos)}
                        >
                          {sig.name}
                        </SignatureField>
                      ))}
                  </>
                )}
              </PDFViewer>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default DocumentViewPage;

