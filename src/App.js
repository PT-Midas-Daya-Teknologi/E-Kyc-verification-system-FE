import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {

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
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition w-full shadow-lg"
          >
            Start Verification
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

          <div className="mt-8">

            <div className="flex justify-between text-sm mb-2">

              <span className="font-medium text-gray-700">
                {statusText}
              </span>

              <span className="font-medium text-blue-600">
                {uploadProgress}%
              </span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">

              <div
                className="bg-blue-600 h-3 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>

            </div>

          </div>
        )}

        {uploadCompleted && (

          <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-5 text-center">

            <div className="text-4xl mb-3">
              ✅
            </div>

            <p className="text-green-700 font-bold text-lg">
              Document Uploaded Successfully
            </p>

            <p className="text-sm text-green-600 mt-2">
              Your document has been securely verified.
            </p>

          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">

          <p className="text-sm text-yellow-700 leading-6">
            Ensure your document is clear and readable.
            Avoid blur, glare, cropped edges or low-quality images.
          </p>

        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading || isDocumentUploaded}
          className={`w-full py-4 rounded-2xl mt-8 text-lg font-semibold transition text-white shadow-lg
          
          ${isUploading || isDocumentUploaded
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"}
          `}
        >

          {
            isUploading
              ? "Uploading Document..."
              : isDocumentUploaded
                ? "Uploaded ✅"
                : "Upload Document"
          }

        </button>

        {isDocumentUploaded && (

          <button
            onClick={handleReupload}
            className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-4 rounded-2xl mt-4 text-lg font-semibold transition"
          >
            Re-upload Document
          </button>

        )}

        {uploadCompleted && (

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl mt-5 text-lg font-semibold transition shadow-lg"
          >
            Proceed to Selfie Verification
          </button>
        )}

      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
      />

    </div>
  );
}

export default App;