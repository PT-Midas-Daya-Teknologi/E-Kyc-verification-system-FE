import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function RecordingPreview() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const previewUrl = location.state?.previewUrl || null;
  const fileName   = location.state?.fileName   || 'kyc-verification.webm';

  // Revoke the object URL when this page unmounts to free memory
  const urlRef = useRef(previewUrl);
  useEffect(() => {
    const url = urlRef.current;
    return () => { if (url) URL.revokeObjectURL(url); };
  }, []);

  const onDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href     = previewUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border-2 border-sky-400 bg-white p-6 shadow-xl">
        <h2 className="text-center text-2xl font-bold text-sky-700">Recording Preview</h2>
        <p className="mt-1 text-center text-sm text-slate-600">Review your recorded verification video.</p>

        <div className="mt-5 overflow-hidden rounded-xl border border-sky-200">
          {previewUrl ? (
            <video src={previewUrl} controls className="mx-auto h-auto w-full max-w-[680px]" />
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">No recorded video available.</div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onDownload}
            className="rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            Download
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecordingPreview;
