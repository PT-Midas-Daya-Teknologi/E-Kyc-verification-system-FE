import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import PageShell from '../layouts/PageShell';
import { uploadVerificationVideo } from '../features/liveness-detection/services/livenessApi';

export default function RecordingPreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const videoUrl = state?.videoUrl;
  const blob = state?.blob;

  // Redirect if accessed directly without state
  useEffect(() => {
    if (!videoUrl) navigate('/', { replace: true });
  }, [videoUrl, navigate]);

  // Best-effort background upload to Spring Boot
  useEffect(() => {
    if (!blob) return;
    const sessionId = localStorage.getItem('kyc_session_id') || 'unknown';
    uploadVerificationVideo(blob, sessionId).catch(() => {
      // Silent — upload failure does not block the user
    });
  }, [blob]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = 'verification-recording.webm';
    a.click();
  };

  if (!videoUrl) return null;

  return (
    <PageShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <CheckCircle2 size={22} className="text-emerald-500 flex-shrink-0" />
          <div>
            <h1 className="text-lg font-bold text-slate-800">Verification Recording</h1>
            <p className="text-xs text-slate-400">Review your liveness session recording below.</p>
          </div>
        </div>

        {/* Video player */}
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            muted
            className="w-full max-h-72 object-contain"
          />
        </div>

        {/* Info strip */}
        <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 text-xs text-sky-700 flex flex-wrap gap-x-3 gap-y-1">
          <span><strong>Format:</strong> WebM</span>
          <span>·</span>
          <span><strong>Bitrate:</strong> 250 kbps</span>
          <span>·</span>
          <span><strong>Status:</strong> Verified ✓</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 flex-1 justify-center py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 flex-1 justify-center py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:from-sky-600 hover:to-blue-700 active:scale-95 transition-all"
          >
            <Download size={15} />
            Download
          </button>
        </div>
      </motion.div>
    </PageShell>
  );
}
