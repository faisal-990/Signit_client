import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PDFViewer from "../components/PDFViewer";
import SignatureField from "../components/SignatureField";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../utils/AuthContext";
import axios from "axios";

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
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
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
  const { token } = useAuth();

  // 1. Fetch Metadata
  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/docs/${id}`)
      .then((res) => setDoc(res.data))
      .catch(() => setLoadError("Failed to fetch document."));

    axios
      .get(`/api/signatures/${id}`)
      .then((res) => setSignatures(res.data || []))
      .catch(() => {});
  }, [id]);

  // 2. Fetch PDF as Blob
  useEffect(() => {
    if (!doc?.url) return;
    axios
      .get(doc.url, { responseType: "blob" })
      .then((res) => {
        const blobUrl = URL.createObjectURL(res.data);
        setPdfBlobUrl(blobUrl);
      })
      .catch(() => setPdfError(true));

    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [doc]);

  const handleAddSignature = (page) => {
    setPendingPage(page);
    setPendingName("");
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
    const existingPdfBytes = await fetch(pdfBlobUrl).then((res) =>
      res.arrayBuffer(),
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    signatures.forEach((sig) => {
      const page = pages[sig.page - 1];
      if (page) {
        // Simple coordinate mapping for demo (assuming 600px render width)
        const pdfPageWidth = page.getWidth();
        const pdfPageHeight = page.getHeight();
        const scale = pdfPageWidth / 600;

        page.drawText(sig.name || "Sign Here", {
          x: sig.x * scale,
          y: pdfPageHeight - sig.y * scale - 20,
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

    // Mark locally as signed
    setSignatures(signatures.map((sig) => ({ ...sig, status: "signed" })));
  };

  const handleSendForSignature = async () => {
    try {
      await axios.post("/api/signature-request", {
        documentId: doc._id,
        recipientEmail,
      });
      setSendStatus("success");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowSendModal(false);
    } catch (err) {
      setSendStatus("error");
    }
  };

  if (loadError) return <div className="p-8 text-red-600">{loadError}</div>;
  if (!doc) return <div className="p-8">Loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showSuccess && (
          <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
            Request Sent! (Check Backend Logs for Link)
          </div>
        )}

        <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 flex-1">
          {/* --- HEADER --- */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Back
              </button>
              <h2 className="text-2xl font-bold text-blue-700">{doc.name}</h2>
            </div>
            <button
              onClick={() => setShowSendModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded shadow"
            >
              Send for Signature
            </button>
          </div>

          {/* --- TOOLBAR (RESTORED) --- */}
          <div className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row items-center gap-4 border border-blue-100">
            <button
              className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded font-bold shadow hover:bg-yellow-500"
              onClick={() => handleAddSignature(1)}
            >
              + Add Signature Field
            </button>
            <span className="text-gray-500 text-sm flex-1 text-center md:text-left">
              Click the button to drop a signature box, then drag it to
              position.
            </span>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 shadow"
              onClick={handleSaveSignatures}
            >
              Download Signed PDF
            </button>
          </div>

          {/* --- PDF VIEWER --- */}
          <div className="overflow-auto border rounded-xl shadow mb-8 flex justify-center bg-white w-full min-h-[500px] p-4">
            {pdfError ? (
              <div className="text-red-600 p-8">Failed to load PDF.</div>
            ) : !pdfBlobUrl ? (
              <div className="p-8 text-gray-500">Loading PDF Document...</div>
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
                          style={sig.style}
                          fontFamily={sig.fontFamily}
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

        {/* Modals */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
              <h3 className="font-bold mb-2">Your Name</h3>
              <input
                className="border w-full p-2 mb-4"
                autoFocus
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignatureStyle}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
              <h3 className="font-bold mb-2">Send via Email</h3>
              <input
                className="border w-full p-2 mb-4"
                placeholder="Email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendForSignature}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

export default DocumentViewPage;
