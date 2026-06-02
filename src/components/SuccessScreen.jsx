import { motion } from 'framer-motion';
import { CheckCircle2, Video, ShieldCheck } from 'lucide-react';

function formatLivenessStatus(result) {
  if (result?.liveness_status) {
    return result.liveness_status.replace(/^Status:\s*/i, '');
  }
  if (result?.status) {
    const confidence = result.confidence != null ? result.confidence : 'N/A';
    const live = result.isLive != null ? result.isLive : false;
    return `${result.status}  Confidence: ${confidence}  Live: ${live}`;
  }
  return 'N/A';
}

export default function SuccessScreen({ result, onViewRecording }) {
  const livenessStatus = formatLivenessStatus(result);
  const faceScore = result?.face_score ?? 'N/A';
  const finalResult = result?.final_result ?? 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6 py-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
      >
        <CheckCircle2 size={72} className="text-emerald-500" strokeWidth={1.5} />
      </motion.div>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">Verification Successful</h2>
        <p className="text-slate-500 text-sm">Your identity has been confirmed successfully.</p>
      </div>

      {/* Verification result details */}
      <div className="verification-results w-full bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 space-y-3 text-left">
        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-emerald-700 font-medium shrink-0">
            <ShieldCheck size={15} /> Liveness Status:
          </span>
          <span className="text-emerald-600 font-semibold text-right">{livenessStatus}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-emerald-700 font-medium">Face Score</span>
          <span className="text-emerald-600 font-bold">{faceScore}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-emerald-700 font-medium">Final Result</span>
          <span className="text-emerald-600 font-bold">{finalResult}</span>
        </div>
      </div>

      {onViewRecording && (
        <button
          onClick={onViewRecording}
          className="flex items-center gap-2 w-full justify-center py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md hover:from-sky-600 hover:to-blue-700 active:scale-95 transition-all duration-200"
        >
          <Video size={17} />
          View Recording
        </button>
      )}
    </motion.div>
  );
}
