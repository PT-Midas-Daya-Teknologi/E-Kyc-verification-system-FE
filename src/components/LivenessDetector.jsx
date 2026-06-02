import { useState, useEffect, useCallback, useRef } from 'react';
import { FaceLivenessDetectorCore } from '@aws-amplify/ui-react-liveness';
import { ThemeProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import {
  createLivenessSession,
  getLivenessResult,
  getAwsCredentials,
} from '../services/api';
import { getKycSessionId } from '../utils/kycSession';

import { setCachedCredentials } from '../services/credentialResolver';
import { useFrameWebSocket } from '../hooks/useFrameWebSocket';

import Spinner from './Spinner';

// ─────────────────────────────────────────────────────────────
// Error Messages
// ─────────────────────────────────────────────────────────────

const ERROR_MESSAGES = {
  SERVER_ERROR:
    'AWS Rekognition server error. Check region and IAM permissions.',

  TIMEOUT:
    'Session timed out. Please try again.',

  RUNTIME_ERROR:
    'Camera or browser error. Please allow camera access and retry.',

  FACE_DISTANCE_ERROR:
    'Move your face closer to the camera.',

  CAMERA_ACCESS_ERROR:
    'Camera access denied. Please allow camera permission.',

  CAMERA_FRAMERATE_ERROR:
    'Camera framerate too low. Use a better camera or lighting.',

  FRESHNESS_TIMEOUT:
    'Could not complete liveness check. Please retry.',

  MOBILE_LANDSCAPE_ERROR:
    'Please rotate your device to portrait mode.',
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function LivenessDetector({
  onSuccess,
  onFailure,
  onError,
  onUserCancel
}) {

  // ───────────────────────────────────────────────────────────
  // State
  // ───────────────────────────────────────────────────────────

  const [verificationData, setVerificationData] = useState(null);

  const [sessionId, setSessionId] = useState(null);

  const [credentials, setCredentials] = useState(null);

  const [loading, setLoading] = useState(true);

  const [fetchingResult, setFetchingResult] = useState(false);

  const [detectorActive, setDetectorActive] = useState(true);

  const [initError, setInitError] = useState(null);

  const analysisFinishedRef = useRef(false);

  const region =
    import.meta.env.VITE_AWS_REGION || 'ap-south-1';

  // ───────────────────────────────────────────────────────────
  // WebSocket Frame Streaming
  // ───────────────────────────────────────────────────────────

  const frameStreamActive =
    detectorActive &&
    !loading &&
    !fetchingResult &&
    !!sessionId;

  useFrameWebSocket({
    active: frameStreamActive,
    sessionId
  });

  // ───────────────────────────────────────────────────────────
  // Initialize Session + AWS Credentials
  // ───────────────────────────────────────────────────────────

  const hasInitialized = useRef(false);

  useEffect(() => {

    if (hasInitialized.current) return;

    hasInitialized.current = true;

    console.log(
      '[LivenessDetector] Initializing verification...'
    );

    Promise.all([
      createLivenessSession(),
      getAwsCredentials()
    ])
      .then(([id, creds]) => {

        console.log(
          '[LivenessDetector] Session ID:',
          id
        );

        console.log(
          '[LivenessDetector] Credentials received'
        );

        // Validate session ID
        if (!id) {
          throw new Error(
            'Backend returned empty sessionId'
          );
        }

        // Validate credentials
        if (
          !creds?.accessKeyId ||
          creds.accessKeyId.trim() === ''
        ) {
          throw new Error(
            'Backend returned empty accessKeyId'
          );
        }

        if (
          !creds?.secretAccessKey ||
          creds.secretAccessKey.trim() === ''
        ) {
          throw new Error(
            'Backend returned empty secretAccessKey'
          );
        }

        if (
          !creds?.sessionToken ||
          creds.sessionToken.trim() === ''
        ) {
          throw new Error(
            'Backend returned empty sessionToken'
          );
        }

        // Cache credentials globally
        setCachedCredentials(creds);

        setSessionId(id);

        setCredentials(creds);

        setLoading(false);

        console.log(
          '[LivenessDetector] Ready for liveness detection'
        );

      })
      .catch((err) => {

        console.error(
          '[LivenessDetector] Initialization failed:',
          err
        );

        const msg =
          err.response?.data?.message ||
          err.message ||
          'Failed to initialize liveness session';

        setInitError(msg);

        setLoading(false);

      });

  }, []);

  // ───────────────────────────────────────────────────────────
  // Credential Provider
  // ───────────────────────────────────────────────────────────

  const credentialProvider = useCallback(async () => {

    const creds = credentials;

    if (
      !creds?.accessKeyId ||
      !creds?.secretAccessKey ||
      !creds?.sessionToken
    ) {
      throw new Error(
        'Credentials not available'
      );
    }

    return {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
    };

  }, [credentials]);

  // ───────────────────────────────────────────────────────────
  // Capture Webcam Frame
  // ───────────────────────────────────────────────────────────

  const captureFrame = async () => {

    const video =
      document.querySelector('video');

    if (!video) {
      throw new Error(
        'Camera video not found'
      );
    }

    const canvas =
      document.createElement('canvas');

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    const ctx =
      canvas.getContext('2d');

    ctx.drawImage(
      video,
      0,
      0
    );

    return new Promise((resolve) => {

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );

    });
  };

  // ───────────────────────────────────────────────────────────
  // Handle Analysis Complete
  // ───────────────────────────────────────────────────────────

  const handleAnalysisComplete = useCallback(async () => {

    if (analysisFinishedRef.current) return;

    analysisFinishedRef.current = true;

    console.log(
      '[LivenessDetector] Analysis completed'
    );

    setDetectorActive(false);

    setFetchingResult(true);

    try {
      const kycSessionId = getKycSessionId();
      if (!kycSessionId) {
        throw new Error(
          'KYC session not found. Please upload your document and start verification again.'
        );
      }

      let result = null;
      let pollAttempts = 0;
      const maxPollAttempts = 10;

      while (pollAttempts < maxPollAttempts) {
        pollAttempts++;
        console.log(`[Polling] Attempt ${pollAttempts}`);

        result = await getLivenessResult(sessionId, kycSessionId);
        console.log('[Polling] Result:', result);

        if (
          result?.overallStatus === 'SUCCESS' ||
          result?.overallStatus === 'FAILURE'
        ) {
          break;
        }

        if (
          !result?.overallStatus &&
          (result?.status === 'SUCCEEDED' || result?.status === 'FAILED')
        ) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!result) {
        throw new Error('No result returned from backend');
      }

      const terminal =
        result.overallStatus === 'SUCCESS' ||
        result.overallStatus === 'FAILURE' ||
        (!result.overallStatus &&
          (result.status === 'SUCCEEDED' || result.status === 'FAILED'));

      if (!terminal) {
        throw new Error('Liveness verification timed out');
      }

      console.log('[LivenessDetector] Final Result:', result);

      const succeeded =
        result.overallStatus === 'SUCCESS' ||
        (!result.overallStatus && result.isLive === true);

      if (succeeded) {
        setVerificationData(result);
        onSuccess(result);
      } else {
        onFailure(result);
      }

    } catch (err) {

      console.error(
        '[LivenessDetector] Result polling failed:',
        err
      );

      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to retrieve verification result';

      onError(msg);

    } finally {

      setFetchingResult(false);

    }

  }, [
    sessionId,
    onSuccess,
    onFailure,
    onError
  ]);

  // ───────────────────────────────────────────────────────────
  // Handle Detector Errors
  // ───────────────────────────────────────────────────────────

  const handleDetectorError = useCallback((error) => {

    if (analysisFinishedRef.current) {

      console.warn(
        '[FaceLivenessDetector] Ignoring post-completion error:',
        error?.state
      );

      return;
    }

    console.error(
      '[FaceLivenessDetector] Error:',
      error
    );

    const errorState =
      error?.state ||
      error?.error?.state ||
      'UNKNOWN_ERROR';

    const awsMessage =
      error?.error?.message ||
      error?.error?.Message ||
      error?.message ||
      '';

    let humanMessage =
      ERROR_MESSAGES[errorState] ||
      `Verification error: ${errorState}`;

    if (
      awsMessage.includes('AccessDenied') ||
      awsMessage.includes('not authorized')
    ) {

      humanMessage =
        'AWS denied StartFaceLivenessSession. Check IAM permissions.';

    } else if (
      errorState === 'CAMERA_ACCESS_ERROR'
    ) {

      humanMessage =
        'Camera access denied. Allow camera access and retry.';

    } else if (
      awsMessage
    ) {

      humanMessage =
        `${humanMessage} (${awsMessage})`;
    }

    onError(humanMessage);

  }, [onError]);

  // ───────────────────────────────────────────────────────────
  // Loading State
  // ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Spinner label="Initializing liveness session..." />
    );
  }

  // ───────────────────────────────────────────────────────────
  // Fetching Result State
  // ───────────────────────────────────────────────────────────

  if (fetchingResult) {
    return (
      <Spinner label="Verifying your identity..." />
    );
  }

  // ───────────────────────────────────────────────────────────
  // Initialization Error
  // ───────────────────────────────────────────────────────────

  if (initError) {

    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">

        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl font-bold">
          !
        </div>

        <p className="text-red-500 font-medium text-sm">
          {initError}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition"
        >
          Retry
        </button>

      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Final Safety Guard
  // ───────────────────────────────────────────────────────────

  if (
    loading ||
    !sessionId ||
    !credentials?.accessKeyId ||
    !credentials?.secretAccessKey ||
    !credentials?.sessionToken
  ) {
    return (
      <Spinner label="Preparing verification..." />
    );
  }

  const rekognitionRegion =
    credentials.region || region;

  // Detector already completed
  if (!detectorActive) {
    return (
      <Spinner label="Verifying your identity..." />
    );
  }

  // ───────────────────────────────────────────────────────────
  // Render Detector
  // ───────────────────────────────────────────────────────────

  return (
    <ThemeProvider>

      <FaceLivenessDetectorCore
        key={sessionId}
        sessionId={sessionId}
        region={rekognitionRegion}
        config={{ credentialProvider }}
        onAnalysisComplete={handleAnalysisComplete}
        onError={handleDetectorError}
        onUserCancel={onUserCancel}
        disableStartScreen={false}
      />

    </ThemeProvider>
  );
}