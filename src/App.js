import React, { useState } from "react";

import axios from "axios";

import {
  useNavigate,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import FaceDetection from "./FaceDetection";

function ProtectedRoute({
  allowed,
  children
}) {

  if (!allowed) {

    return <Navigate to="/" replace />;
  }

  return children;
}

function DocumentUpload({
  setSelfieAllowed
}) {

  const navigate = useNavigate();

  const [started, setStarted] = useState(false);

  const [token, setToken] = useState("");

  const [username, setUsername] = useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [documentType, setDocumentType] =
    useState("");

  const [frontFile, setFrontFile] =
    useState(null);

  const [frontPreview, setFrontPreview] =
    useState("");

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [statusText, setStatusText] =
    useState("");

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadCompleted, setUploadCompleted] =
    useState(false);

  const [isDocumentUploaded,
    setIsDocumentUploaded] = useState(false);

  const allowedTypes = [
    "image/jpeg",
    "image/png"
  ];

  const startKycSession = async () => {

    try {

      if (!username) {

        toast.error(
          "Please enter username"
        );

        return;
      }

      const response = await axios.post(
        `http://localhost:8080/kyc/initiate?username=${username}`
      );

      if (
        response.status === 200 &&
        response.data?.body?.token
      ) {

        const generatedToken =
          response.data.body.token;

        setToken(generatedToken);

        setStarted(true);

        setCustomerName(
          response.data.body.customerName
          || username
        );

        toast.success(
          "KYC session started successfully"
        );

      } else {

        toast.error(
          "Failed to initiate KYC session"
        );
      }

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to initiate KYC session"
      );

      setStarted(false);
    }
  };

  const handleFrontFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {

      toast.error(
        "Only JPG and PNG image files are allowed"
      );

      e.target.value = null;

      return;
    }

    const maxFileSize = 500 * 1024;

    if (file.size > maxFileSize) {

      toast.error(
        "Maximum allowed image size is 500 KB"
      );

      e.target.value = null;

      return;
    }

    setUploadProgress(0);

    setUploadCompleted(false);

    setStatusText("");

    setIsDocumentUploaded(false);

    setFrontFile(file);

    setFrontPreview(
      URL.createObjectURL(file)
    );

    toast.success(
      "Document selected successfully"
    );
  };

  const handleUpload = async () => {

    try {

      if (!documentType) {

        toast.error(
          "Please select document type"
        );

        return;
      }

      if (!frontFile) {

        toast.error(
          "Please upload document"
        );

        return;
      }

      if (!token) {

        toast.error(
          "KYC session not started"
        );

        return;
      }

      if (isDocumentUploaded) {

        return;
      }

      setIsUploading(true);

      setUploadCompleted(false);

      setUploadProgress(0);

      setStatusText(
        "Uploading Document Securely..."
      );

      

      const javaFormData = new FormData();

      let backendDocumentType = "";

      if (documentType === "Aadhar Card") {

        backendDocumentType =
          "AADHAR_CARD";
      }

      if (documentType === "PAN Card") {

        backendDocumentType =
          "PAN_CARD";
      }

      if (documentType === "Passport") {

        backendDocumentType =
          "PASSPORT";
      }

      if (
        documentType ===
        "Driving License"
      ) {

        backendDocumentType =
          "DRIVING_LICENSE";
      }


      javaFormData.append(
        "file",
        frontFile
      );

      javaFormData.append(
        "documentType",
        backendDocumentType
      );

      

      await axios.post(
        "http://localhost:8080/kyc/upload",
        javaFormData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data"
          },

          onUploadProgress:
            (progressEvent) => {

              const percentCompleted =
                Math.round(
                  (
                    progressEvent.loaded * 100
                  ) /
                  progressEvent.total
                );

              setUploadProgress(
                percentCompleted
              );

              if (
                percentCompleted > 10
              ) {

                setStatusText(
                  "Uploading Document Securely..."
                );
              }

              if (
                percentCompleted > 30
              ) {

                setStatusText(
                  "Saving Document..."
                );
              }

              if (
                percentCompleted > 50
              ) {

                setStatusText(
                  "Running OCR Analysis..."
                );
              }

              if (
                percentCompleted > 70
              ) {

                setStatusText(
                  "Validating Document..."
                );
              }

              if (
                percentCompleted > 90
              ) {

                setStatusText(
                  "Final Verification..."
                );
              }
            }
        }
      );

     

      const pythonFormData =
        new FormData();


      pythonFormData.append(
        "id_document_file",
        frontFile
      );

      const ocrResponse =
        await axios.post(
          "http://127.0.0.1:8000/ocr_analysis",
          pythonFormData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }
        );

      console.log(
        "OCR RESPONSE",
        ocrResponse.data
      );

      setUploadProgress(100);

      setStatusText(
        "Verification Completed"
      );

      setTimeout(() => {

        setIsUploading(false);

        setUploadCompleted(true);

        setIsDocumentUploaded(true);

        setSelfieAllowed(true);

        setUploadProgress(0);

        setStatusText("");

        toast.success(
          "KYC Document Uploaded Successfully"
        );

      }, 1200);

    } catch (error) {

      console.error(error);

      setIsUploading(false);

      setUploadCompleted(false);

      setUploadProgress(0);

      setStatusText("");

      if (
        error.response?.data?.errors
          ?.length > 0
      ) {

        toast.error(
          error.response.data.errors[0]
            .message
        );

      } else {

        toast.error(
          "Backend connection failed"
        );
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

    toast.info(
      "Please upload document again"
    );
  };

  const handleSelfieVerification =
    () => {

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
            Secure identity verification process
            for document authentication and
            fraud prevention.
          </p>

          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="
              w-full
              mt-6
              p-4
              rounded-2xl
              border
              border-gray-300
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          <button

            onClick={startKycSession}

            className="
              mt-6
              w-full
              py-4
              rounded-2xl
              text-lg
              font-semibold
              text-white
              bg-gradient-to-r
              from-sky-500
              to-blue-600
              hover:from-sky-600
              hover:to-blue-700
              shadow-lg
            "
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

            <span className="text-3xl">
              🪪
            </span>

          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Identity Verification
          </h1>

          <p className="text-gray-500 mt-2">
            Customer Name:
            {" "}
            {customerName}
          </p>

        </div>

        <div className="mt-8">

          <label className="block text-sm font-semibold text-gray-700 mb-2">

            Document Type

          </label>

          <select
            value={documentType}
            onChange={(e) =>
              setDocumentType(
                e.target.value
              )
            }
            className="
              w-full
              border
              border-gray-300
              rounded-xl
              p-4
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >

            <option value="">
              Select document
            </option>

            <option>
              Aadhar Card
            </option>

            <option>
              PAN Card
            </option>

            <option>
              Passport
            </option>

            <option>
              Driving License
            </option>

          </select>

        </div>

        <div className="mt-8">

          <label className="block text-sm font-semibold text-gray-700 mb-3">

            Upload Document

          </label>

          <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 bg-blue-50 text-center">

            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={
                handleFrontFileChange
              }
              className="mb-4"
            />

            <p className="text-gray-700 font-medium">
              Upload your ID document
            </p>

            <p className="text-sm text-gray-500 mt-2">
              JPG and PNG only
              (Max 500 KB)
            </p>

          </div>

        </div>

        {frontFile && (

          <div className="mt-6">

            <div className="border rounded-2xl overflow-hidden bg-gray-100 shadow">

              <img
                src={frontPreview}
                alt="document-preview"
                className="w-full h-80 object-contain"
              />

            </div>

          </div>
        )}

        {isUploading &&
          uploadProgress > 0 && (

            <div className="mt-8 border border-sky-100 bg-sky-50 rounded-2xl p-5">

              <div className="flex justify-between items-center mb-3">

                <span className="font-medium text-sky-800">

                  {statusText}

                </span>

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
                    to-blue-600
                    transition-all
                    duration-500
                  "
                  style={{
                    width:
                      `${uploadProgress}%`
                  }}
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
            className="
              w-full
              py-4
              rounded-2xl
              mt-8
              text-lg
              font-semibold
              border
              border-sky-400
              bg-sky-50
              text-sky-700
              hover:bg-sky-100
            "
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
              onClick={
                handleSelfieVerification
              }
              className="
                w-full
                border
                border-sky-400
                bg-sky-50
                text-sky-700
                hover:bg-sky-100
                py-4
                rounded-2xl
                text-lg
                font-semibold
              "
            >

              Proceed to Selfie Verification

            </button>

            <button
              onClick={handleReupload}
              className="
                w-full
                text-sm
                text-gray-500
                hover:text-blue-600
                mt-4
              "
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

  const [selfieAllowed,
    setSelfieAllowed] =
    useState(false);

  return (

    <Routes>

      <Route
        path="/"
        element={
          <DocumentUpload
            setSelfieAllowed={
              setSelfieAllowed
            }
          />
        }
      />

      <Route
        path="/kyc-verification"
        element={
          <ProtectedRoute
            allowed={selfieAllowed}
          >

            <FaceDetection />

          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <Navigate to="/" replace />
        }
      />

    </Routes>
  );
}

export default App;