import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ErrorScreen({ message, onRetry, showRetry = true }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-5 py-8 text-center"
    >
      <AlertTriangle size={60} className="text-amber-500" strokeWidth={1.5} />
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">Something Went Wrong</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">{message || 'An unexpected error occurred. Please try again.'}</p>
      </div>
      {showRetry && (
        <button
          onClick={onRetry}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold hover:from-sky-600 hover:to-blue-700 active:scale-95 transition-all"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}
