import { motion } from 'framer-motion';
import { XCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FailureScreen({ result, onRetry, showRetry = true }) {
  const finalResult = result?.pythonResponse?.final_result ?? result?.finalResult ?? 'N/A';
  const confidence = result?.pythonResponse?.confidence ?? 'N/A';
  const verified = result?.pythonResponse?.verified ?? 'N/A';
  const attemptNo = result?.pythonResponse?.attempt_no ?? result?.attemptNo ?? 'N/A';
  const navigate = useNavigate();
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  // Auto-redirect after 10 seconds when max attempts reached
  useEffect(() => {
    if (!showRetry) {
      setRedirectCountdown(10);
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Redirect to home/starting page
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showRetry, navigate]);

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

      {/* Failure details with face verification data */}
      <div className="w-full bg-red-50 border border-red-200 rounded-xl px-5 py-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-red-700 font-medium">Liveness Status</span>
          <span className="text-red-600 font-bold">NOT CONFIRMED</span>
        </div>

        {/* Show face verification results from Python API */}
        {(confidence !== 'N/A' || finalResult !== 'N/A') && (
          <>
            <div className="border-t border-red-200 pt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs text-red-600 mb-1">
                <AlertCircle size={12} />
                Face Verification Details:
              </div>

              {finalResult !== 'N/A' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-700">Face Match Result</span>
                  <span className="text-red-600 font-bold">{finalResult}</span>
                </div>
              )}

              {confidence !== 'N/A' && typeof confidence === 'number' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-700">Face Score</span>
                  <span className="text-red-600 font-bold">{confidence}</span>
                </div>
              )}

              {verified !== 'N/A' && typeof verified === 'boolean' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-700">Face Verified</span>
                  <span className={`font-bold ${verified ? 'text-emerald-600' : 'text-red-600'}`}>
                    {verified ? 'Yes' : 'No'}
                  </span>
                </div>
              )}

              {attemptNo !== 'N/A' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-700">Attempt</span>
                  <span className="text-red-600 font-bold">{attemptNo} / 3</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Max attempts reached - show redirect message */}
      {!showRetry && redirectCountdown !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-orange-50 border-2 border-orange-400 rounded-xl px-5 py-4 text-center space-y-2"
        >
          <p className="text-orange-800 font-semibold text-base">Limit Exceeded</p>
          <p className="text-orange-700 text-sm">
            You have reached the maximum number of attempts.
          </p>
          <motion.p
            key={redirectCountdown}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-orange-900 font-bold text-lg"
          >
            You will be redirected in {redirectCountdown}s
          </motion.p>
        </motion.div>
      )}

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
