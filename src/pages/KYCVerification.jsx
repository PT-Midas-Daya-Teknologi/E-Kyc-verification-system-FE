import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getKycSessionId,
  resetAttemptCount,
  setAttemptCount,
} from '../utils/kycSession';

// Layouts
import PageShell from '../layouts/PageShell';

// Features - AWS Liveness
import VerificationCard from '../features/liveness-detection/components/VerificationCard';
import LivenessDetector from '../features/liveness-detection/components/LivenessDetector';
import SuccessScreen from '../features/liveness-detection/components/SuccessScreen';
import FailureScreen from '../features/liveness-detection/components/FailureScreen';
import ErrorScreen from '../features/liveness-detection/components/ErrorScreen';
import LivenessMethodSelector from '../features/liveness-detection/components/LivenessMethodSelector';

// Features - LiveKit Liveness
import LiveKitDetector from '../features/liveness-detection-livekit/components/LiveKitDetector';

const STEP = {
  IDLE: 'idle',
  METHOD_SELECT: 'method_select',
  LIVENESS_AWS: 'liveness_aws',
  LIVENESS_LIVEKIT: 'liveness_livekit',
  SUCCESS: 'success',
  FAILURE: 'failure',
  ERROR: 'error',
};

export default function KYCVerification() {
  const [step, setStep] = useState(STEP.IDLE);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    setStep(STEP.METHOD_SELECT);
  }, []);

  const handleMethodSelect = useCallback((method) => {
    if (method === 'aws') {
      setStep(STEP.LIVENESS_AWS);
    } else if (method === 'livekit') {
      setStep(STEP.LIVENESS_LIVEKIT);
    }
  }, []);

  const handleSuccess = useCallback((livenessResult) => {
    const kycSessionId = getKycSessionId();
    if (kycSessionId) {
      resetAttemptCount(kycSessionId);
    }
    setResult(livenessResult);
    setStep(STEP.SUCCESS);
  }, []);

  const handleFailure = useCallback((livenessResult) => {
    const attemptCount =
      livenessResult?.attemptNo ??
      livenessResult?.pythonResponse?.attempt_no ??
      livenessResult?.attemptCount ??
      livenessResult?.attempt_count ??
      0;

    const kycSessionId = getKycSessionId();
    if (kycSessionId) {
      setAttemptCount(kycSessionId, attemptCount);
    }

    if (attemptCount >= 3) {
      toast.error('You have consumed the maximum number of attempts');
    }

    setResult(livenessResult);
    setStep(STEP.FAILURE);
  }, []);

  const handleError = useCallback((msg) => {
    setErrorMsg(typeof msg === 'string' ? msg : 'Liveness check encountered an error.');
    setStep(STEP.ERROR);
  }, []);

  const canRetry = (livenessResult) => {
    const attemptCount =
      livenessResult?.attemptNo ??
      livenessResult?.pythonResponse?.attempt_no ??
      livenessResult?.attemptCount ??
      livenessResult?.attempt_count ??
      0;
    return attemptCount < 3;
  };

  const handleCancel = useCallback(() => {
    setStep(STEP.IDLE);
  }, []);

  const handleRetry = useCallback(() => {
    setResult(null);
    setErrorMsg('');
    setStep(STEP.IDLE);
  }, []);

  return (
    <PageShell>
      <AnimatePresence mode="wait">
        {step === STEP.IDLE && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VerificationCard onStart={handleStart} />
          </motion.div>
        )}

        {step === STEP.METHOD_SELECT && (
          <motion.div key="method" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LivenessMethodSelector onSelect={handleMethodSelect} onBack={handleRetry} />
          </motion.div>
        )}

        {step === STEP.LIVENESS_AWS && (
          <motion.div key="liveness-aws" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LivenessDetector
              onSuccess={handleSuccess}
              onFailure={handleFailure}
              onError={handleError}
              onUserCancel={handleCancel}
            />
          </motion.div>
        )}

        {step === STEP.LIVENESS_LIVEKIT && (
          <motion.div key="liveness-livekit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LiveKitDetector
              onSuccess={handleSuccess}
              onFailure={handleFailure}
              onError={handleError}
              onUserCancel={handleCancel}
            />
          </motion.div>
        )}

        {step === STEP.SUCCESS && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SuccessScreen result={result} />
          </motion.div>
        )}

        {step === STEP.FAILURE && (
          <motion.div key="failure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FailureScreen
              result={result}
              onRetry={handleRetry}
              showRetry={canRetry(result)}
            />
          </motion.div>
        )}

        {step === STEP.ERROR && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorScreen
              message={errorMsg}
              onRetry={handleRetry}
              showRetry={!result || canRetry(result)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
