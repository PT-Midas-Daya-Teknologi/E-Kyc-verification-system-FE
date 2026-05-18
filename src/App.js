import React, { useState } from "react";
import {
  useNavigate,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import KYCVerificationPage from "./pages/KYCVerificationPage";
import RecordingPreview from "./pages/RecordingPreview";

function DocumentUpload() {

  const navigate = useNavigate();

  const [started, setStarted] = useState(false);

  const [documentType, setDocumentType] = useState("");

  const [frontFile, setFrontFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const [uploadCompleted, setUploadCompleted] = useState(false);

  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf"
  ];

  const handleFrontFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {

      toast.error("Only JPG, PNG and PDF files are allowed");

      e.target.value = null;

      return;
    }

    setUploadProgress(0);
    setUploadCompleted(false);

    setStatusText("");

    setIsDocumentUploaded(false);

    setFrontFile(file);

    setFrontPreview(URL.createObjectURL(file));

    toast.success("Document selected successfully");
  };

  const handleUpload = () => {

    if (!documentType) {

      toast.error("Please select document type");

      return;
    }

    if (!frontFile) {

      toast.error("Please upload document");

      return;
    }

    if (isDocumentUploaded) {

      return;
    }

    setIsUploading(true);

    setUploadCompleted(false);

    setUploadProgress(0);

    setStatusText("Uploading Document Securely...");

    let progress = 0;

    const interval = setInterval(() => {

      progress += Math.floor(Math.random() * 12);

      if (progress > 20) {
        setStatusText("Processing Document...");
      }

      if (progress > 40) {
        setStatusText("Running OCR Extraction...");
      }

      if (progress > 65) {
        setStatusText("Validating Document Authenticity...");
      }

      if (progress > 85) {
        setStatusText("Final Verification...");
      }

      if (progress >= 100) {

        progress = 100;

        clearInterval(interval);

        setStatusText("Document Uploaded Successfully");

        setTimeout(() => {

          setIsUploading(false);

          setUploadCompleted(true);

          setIsDocumentUploaded(true);

          toast.success("KYC Document Uploaded Successfully");

        }, 800);
      }

      setUploadProgress(progress);

    }, 350);
  };

  const handleReupload = () => {

    setFrontFile(null);

    setFrontPreview("");

    setUploadProgress(0);

    setStatusText("");

    setUploadCompleted(false);

    setIsDocumentUploaded(false);

    toast.info("Please upload document again");
  };

  const handleSelfieVerification = () => {

    navigate("/kyc-verification");
  };

  if (!started) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center p-6">

        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center w-full max-w-md">

          <div className="text-6xl mb-5">
            🪪
          </div>

          <h1 className="text-4xl font-bold text-gray-800">
            KYC Verification
          </h1>

          <p className="text-gray-500 mt-4 leading-7">
            Secure identity verification process for document authentication and fraud prevention.
          </p>

          <button
            onClick={() => setStarted(true)}
            className="
              mt-8
              w-full
              relative
              overflow-hidden
              py-4
              rounded-2xl
              text-lg
              font-semibold
              text-white
              transition-all
              duration-300
              bg-gradient-to-r
              from-sky-500
              via-blue-500
              to-blue-600
              hover:from-sky-600
              hover:via-blue-600
              hover:to-blue-700
              shadow-lg
              hover:shadow-2xl
              hover:-translate-y-0.5
              active:scale-[0.98]
              border
              border-blue-300
            "
          >

            <span className="
              absolute
              inset-0
              bg-white/10
              opacity-0
              hover:opacity-100
              transition
            "></span>

            <span className="relative flex items-center justify-center gap-2">

              <span className="text-xl">
                
              </span>

              <span>
                Start Verification
              </span>

            </span>

          </button>

        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
        />

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">

      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8">

        <div className="text-center">

          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow">

            <span className="text-3xl">🪪</span>

          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Identity Verification
          </h1>

          <p className="text-gray-500 mt-2">
            Secure KYC Verification Portal
          </p>

        </div>

        <div className="mt-8">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Document Type
          </label>

          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select document</option>
            <option>Aadhar Card</option>
            <option>PAN Card</option>
            <option>Passport</option>
            <option>Driving License</option>
          </select>

        </div>

        <div className="mt-8">

          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Upload Document
          </label>

          <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 bg-blue-50 text-center hover:bg-blue-100 transition">

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFrontFileChange}
              className="mb-4"
            />

            <p className="text-gray-700 font-medium">
              Upload your ID document
            </p>

            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG or PDF only
            </p>

          </div>

        </div>

        {frontFile && (

          <div className="mt-6">

            <div className="flex items-center justify-between mb-3">

              <div>

                <p className="font-semibold text-gray-700">
                  Document Selected
                </p>

                <p className="text-sm text-gray-500">
                  {frontFile.name}
                </p>

              </div>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                Ready
              </span>

            </div>

            {frontFile.type.startsWith("image/") ? (

              <div className="border rounded-2xl overflow-hidden bg-gray-100 shadow">

                <img
                  src={frontPreview}
                  alt="document-preview"
                  className="w-full h-80 object-contain"
                />

              </div>

            ) : (

              <iframe
                src={frontPreview}
                title="document-pdf"
                className="w-full h-96 rounded-2xl border"
              />
            )}

          </div>
        )}

        {uploadProgress > 0 && (

          <div className="mt-8 border border-sky-100 bg-sky-50 rounded-2xl p-5">

            <div className="flex justify-between items-center mb-3">

              <div className="flex items-center gap-2">

                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></div>

                <span className="font-medium text-sky-800">
                  {statusText}
                </span>

              </div>

              <span className="font-semibold text-sky-700">
                {uploadProgress}%
              </span>

            </div>

            <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-sky-200">

              <div
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-sky-400
                  via-sky-500
                  to-blue-600
                  transition-all
                  duration-500
                "
                style={{ width: `${uploadProgress}%` }}
              ></div>

            </div>

          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">

          <p className="text-sm text-yellow-700 leading-6">
            Ensure your document is clear and readable.
            Avoid blur, glare, cropped edges or low-quality images.
          </p>

        </div>

        {!uploadCompleted && (

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`
              w-full
              py-4
              rounded-2xl
              mt-8
              text-lg
              font-semibold
              transition-all
              duration-300
              border
              shadow-md
          
              ${isUploading
                ? `
                  bg-gray-200
                  text-gray-500
                  border-gray-300
                  cursor-not-allowed
                `
                : `
                  border-sky-400
                  bg-sky-50
                  text-sky-700
                  hover:bg-sky-100
                  hover:shadow-lg
                `
              }
            `}
          >

            {
              isUploading
                ? "Uploading Document..."
                : "Upload Document"
            }

          </button>
        )}

        {uploadCompleted && (

          <div className="mt-8">

            <button
              onClick={handleSelfieVerification}
              className="w-full border border-sky-400 bg-sky-50 text-sky-700 hover:bg-sky-100 py-4 rounded-2xl text-lg font-semibold transition"
            >
              Proceed to Selfie Verification
            </button>

            <button
              onClick={handleReupload}
              className="w-full text-sm text-gray-500 hover:text-blue-600 mt-4 transition"
            >
              Re-upload Document
            </button>

          </div>
        )}

      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
      />

    </div>
  );
}

function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<DocumentUpload />}
      />

      <Route
        path="/kyc-verification"
        element={<KYCVerificationPage />}
      />

      <Route
        path="/recording"
        element={<RecordingPreview />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;