import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// AWS Amplify
import { configureAmplify } from "./services/amplifyConfig";

// Components & Pages
import KYCVerification from "./pages/KYCVerification";
import RecordingPreview from "./pages/RecordingPreview";
import DocumentUpload from "./features/document-verification/DocumentUpload";

// Initialize Amplify
configureAmplify();

function ProtectedRoute({ allowed, children }) {
  if (!allowed) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [selfieAllowed, setSelfieAllowed] = useState(false);

  return (
    <BrowserRouter>
      {/* Centralized ToastContainer at the root */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        {/* Document Upload Feature */}
        <Route
          path="/"
          element={
            <DocumentUpload
              setSelfieAllowed={setSelfieAllowed}
            />
          }
        />

        {/* Liveness Verification Feature */}
        <Route
          path="/kyc-verification"
          element={
            <ProtectedRoute allowed={selfieAllowed}>
              <KYCVerification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recording"
          element={
            <ProtectedRoute allowed={selfieAllowed}>
              <RecordingPreview />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
