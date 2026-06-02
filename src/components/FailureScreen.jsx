import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

export default function FailureScreen({ result, onRetry, showRetry = true }) {
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
        <XCircle size={72} className="text-red-500" strokeWidth={1.5} />
      </motion.div>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">Verification Failed</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          We could not confirm your liveness. Use good lighting, face the camera, and try again.
        </p>
      </div>

      <div className="w-full bg-red-50 border border-red-200 rounded-xl px-5 py-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-red-700 font-medium">Liveness Status</span>
          <span className="text-red-600 font-bold">NOT CONFIRMED</span>
        </div>
      </div>

      {showRetry && (
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md hover:from-sky-600 hover:to-blue-700 active:scale-95 transition-all duration-200"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}
