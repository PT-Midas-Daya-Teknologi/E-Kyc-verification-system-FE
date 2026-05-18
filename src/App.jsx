import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppErrorBoundary from './components/AppErrorBoundary';
import KYCVerificationPage from './pages/KYCVerificationPage';
import RecordingPreview from './pages/RecordingPreview';

export default function App() {
  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              boxShadow: '0 12px 24px rgba(56,189,248,0.12)',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<KYCVerificationPage />} />
          <Route path="/recording" element={<RecordingPreview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AppErrorBoundary>
  );
}
