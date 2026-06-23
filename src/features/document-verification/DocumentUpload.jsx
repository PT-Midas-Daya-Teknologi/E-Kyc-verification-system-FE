import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { saveKycSessionId } from "../../utils/kycSession";
import { initiateKycSession, uploadDocument } from "./services/documentApi";

export default function DocumentUpload({ setSelfieAllowed }) {
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [username, setUsername] = useState("");
  const [isInitiating, setIsInitiating] = useState(false);
  const [token, setToken] = useState("");

  const [documentType, setDocumentType] = useState("");
  const [frontFile, setFrontFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);

  const allowedTypes = ["image/jpeg", "image/png"];

  const startKycSession = async () => {
    if (!username) {
      toast.error("Please enter username");
      return;
    }

    try {
      setIsInitiating(true);
      const data = await initiateKycSession(username);
      
      const body = data.body;
      const generatedToken = body.token;
      const sessionId = body.sessionId;

      setToken(generatedToken);
      localStorage.setItem("kyc_token", generatedToken);

      if (sessionId) {
        saveKycSessionId(sessionId);
      }

      setStarted(true);
      setShowUsernameForm(false);
      toast.success("KYC Session Started");
    } catch (error) {
      toast.error("Failed to initiate KYC session");
    } finally {
      setIsInitiating(false);
    }
  };

  const handleFrontFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG and PNG image files are allowed");
      e.target.value = null;
      return;
    }

    const maxFileSize = 500 * 1024;
    if (file.size > maxFileSize) {
      toast.error("Maximum allowed image size is 500 KB");
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

  const handleUpload = async () => {
    try {
      if (!documentType) {
        toast.error("Please select document type");
        return;
      }
      if (!frontFile) {
        toast.error("Please upload document");
        return;
      }
      if (!token) {
        toast.error("KYC session not started");
        return;
      }
      if (isDocumentUploaded) return;

      setIsUploading(true);
      setUploadCompleted(false);
      setUploadProgress(0);
      setStatusText("Uploading Document Securely...");

      const backendDocumentTypeMap = {
        "Aadhar Card": "AADHAR_CARD",
        "PAN Card": "PAN_CARD",
        "Passport": "PASSPORT",
        "Driving License": "DRIVING_LICENSE",
      };

      const backendDocumentType = backendDocumentTypeMap[documentType];

      // Note: uploadDocument in service doesn't handle progress yet, 
      // but we can simulate or update the service later if needed.
      // For now, let's just call it.
      await uploadDocument(frontFile, backendDocumentType);

      setUploadProgress(100);
      setStatusText("Finalizing Verification...");

      setTimeout(() => {
        setIsUploading(false);
        setUploadCompleted(true);
        setIsDocumentUploaded(true);
        setSelfieAllowed(true);
        toast.success("KYC Document Uploaded Successfully");
      }, 1200);

    } catch (error) {
      setIsUploading(false);
      setUploadCompleted(false);
      setUploadProgress(0);
      setStatusText("");

      if (error.response?.data?.errors?.length > 0) {
        toast.error(error.response.data.errors[0].message);
      } else {
        toast.error("Backend connection failed");
      }
    }
  };

  const handleReupload = () => {
    setFrontFile(null);
    setFrontPreview("");
    setUploadProgress(0);
    setStatusText("");
    setUploadCompleted(false);
    setIsDocumentUploaded(false);
    setSelfieAllowed(false);
    toast.info("Please upload document again");
  };

  const handleSelfieVerification = () => {
    navigate("/kyc-verification");
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center w-full max-w-md">
          <div className="text-6xl mb-5">🪪</div>
          <h1 className="text-4xl font-bold text-gray-800">KYC Verification</h1>
          <p className="text-gray-500 mt-4 leading-7">
            Secure identity verification process for document authentication and fraud prevention.
          </p>

          {!showUsernameForm ? (
            <button
              onClick={() => setShowUsernameForm(true)}
              className="mt-8 w-full py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-sky-500 via-blue-500 to-blue-600 hover:from-sky-600 hover:via-blue-600 hover:to-blue-700 transition-all"
            >
              Start Verification
            </button>
          ) : (
            <div className="space-y-4 mt-8 text-left">
              <label className="block text-sm font-semibold text-gray-700">
                Enter your username to begin
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full border border-gray-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={startKycSession}
                  disabled={isInitiating}
                  className="w-full py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-sky-500 via-blue-500 to-blue-600 hover:from-sky-600 hover:via-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {isInitiating ? "Starting..." : "Continue"}
                </button>
                <button
                  onClick={() => setShowUsernameForm(false)}
                  className="w-full py-4 rounded-2xl text-lg font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
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
          <h1 className="text-3xl font-bold text-gray-800">Identity Verification</h1>
          <p className="text-gray-500 mt-2">Secure KYC Verification Portal</p>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Document</label>
          <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 bg-blue-50 text-center hover:bg-blue-100 transition">
            <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFrontFileChange} className="mb-4" />
            <p className="text-gray-700 font-medium">Upload your ID document</p>
            <p className="text-sm text-gray-500 mt-2">JPG and PNG only (Max 500 KB)</p>
          </div>
        </div>

        {frontFile && (
          <div className="mt-6">
            <div className="border rounded-2xl overflow-hidden bg-gray-100 shadow">
              <img src={frontPreview} alt="document-preview" className="w-full h-80 object-contain" />
            </div>
          </div>
        )}

        {isUploading && uploadProgress > 0 && (
          <div className="mt-8 border border-sky-100 bg-sky-50 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-sky-800">{statusText}</span>
              <span className="font-semibold text-sky-700">{uploadProgress}%</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-sky-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <p className="text-sm text-yellow-700 leading-6">
            Ensure your document is clear and readable. Avoid blur, glare, cropped edges or low-quality images.
          </p>
        </div>

        {!uploadCompleted && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full py-4 rounded-2xl mt-8 text-lg font-semibold border border-sky-400 bg-sky-50 text-sky-700 hover:bg-sky-100"
          >
            {isUploading ? "Uploading Document..." : "Upload Document"}
          </button>
        )}

        {uploadCompleted && (
          <div className="mt-8">
            <button
              onClick={handleSelfieVerification}
              className="w-full border border-sky-400 bg-sky-50 text-sky-700 hover:bg-sky-100 py-4 rounded-2xl text-lg font-semibold"
            >
              Proceed to Selfie Verification
            </button>
            <button onClick={handleReupload} className="w-full text-sm text-gray-500 hover:text-blue-600 mt-4">
              Re-upload Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
