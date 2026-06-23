import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

const STEPS = [
  'Allow camera access when prompted',
  'Follow on-screen face movement instructions',
  'Verification completes automatically',
];

export default function VerificationCard({
  onStart,
  verificationResult,
  isVerified,
}) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-6"
    >

      {/* Badge */}
      <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide">
        <ShieldCheck size={13} />
        KYC Identity Verification
      </div>

      {/* Success State */}
      {isVerified ? (
        <div className="w-full flex flex-col items-center gap-5">

          {/* Green Tick */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 180 }}
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-lg"
          >
            <CheckCircle2
              size={60}
              className="text-green-600"
            />
          </motion.div>

          {/* Success Message */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600">
              Verification Successful
            </h2>

            <p className="text-slate-500 text-sm mt-1">
              Your identity has been verified successfully.
            </p>
          </div>

          {/* API Response Card */}
          {verificationResult && (
            <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm space-y-3">

              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">
                  Verification Status
                </span>

                <span className="font-semibold text-green-600">
                  {verificationResult.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">
                  Confidence Score
                </span>

                <span className="font-bold text-green-600 text-lg">
                  {verificationResult.confidence?.toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">
                  Live Detection
                </span>

                <span className="font-semibold text-green-600">
                  {verificationResult.live ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex justify-between items-start gap-3">
                <span className="text-slate-500 text-sm">
                  Session ID
                </span>

                <span className="text-xs text-slate-700 break-all text-right">
                  {verificationResult.session_id}
                </span>
              </div>

            </div>
          )}
        </div>
      ) : (
        <>
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-md">
            <ShieldCheck
              size={30}
              className="text-white"
            />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-800">
              Active Liveness Verification
            </h1>

            <p className="text-slate-500 text-sm leading-relaxed">
              Complete the face verification process to confirm your identity securely.
            </p>
          </div>

          {/* Steps */}
          <ul className="w-full space-y-2.5 text-sm text-slate-600">
            {STEPS.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-600 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>

                {step}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={onStart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-base shadow-md hover:from-sky-600 hover:to-blue-700 active:scale-95 transition-all duration-200"
          >
            Start Verification
          </button>

          <p className="text-xs text-slate-400 text-center">
            Secured by Amazon Rekognition Face Liveness · End-to-end encrypted
          </p>
        </>
      )}
    </motion.div>
  );
}