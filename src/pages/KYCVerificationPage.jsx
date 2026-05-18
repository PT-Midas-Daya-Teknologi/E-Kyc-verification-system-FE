import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import FaceDetection from '../components/FaceDetection';
import LivenessInstruction from '../components/LivenessInstruction';
import SuccessScreen from '../components/SuccessScreen';
import VerificationButtons from '../components/VerificationButtons';
import WebcamFeed from '../components/WebcamFeed';

import { useLivenessDetection } from '../hooks/useLivenessDetection';
import { useVideoRecorder } from '../hooks/useVideoRecorder';

function KYCVerificationPage() {

  const navigate = useNavigate();

  const webcamRef = useRef(null);

  const recorderStartedRef = useRef(false);

  const [sessionStarted, setSessionStarted] = useState(true);

  const [mediaReady, setMediaReady] = useState(false);

  const [detectorEnabled, setDetectorEnabled] = useState(false);

  const [cameraStatus, setCameraStatus] = useState('Initializing camera...');

  const recorder = useVideoRecorder();

  const {
    steps,
    stepIndex,
    currentStep,
    statusText,
    detectedStepId,
    completed,
    sessionSeconds,
    spoofWarning,
    start,
    restart,
    processFrame,
  } = useLivenessDetection({ mirroredPreview: true });

  const handleDetect = useCallback(
    (payload) => {

      processFrame(payload);

      if (payload.faceCount === 0) {

        setCameraStatus('Face not detected');

      } else if (payload.faceCount > 1) {

        setCameraStatus('Multiple faces detected');

      } else {

        setCameraStatus('Face detected');
      }

    },
    [processFrame]
  );

  useEffect(() => {

    if (!sessionStarted || !mediaReady || recorderStartedRef.current) {
      return;
    }

    let cancelled = false;

    let attempts = 0;

    const startRecording = () => {

      const stream =
        webcamRef.current?.stream ||
        webcamRef.current?.video?.srcObject;

      if (stream && !cancelled) {

        recorder.start(stream);

        recorderStartedRef.current = true;

        setDetectorEnabled(true);

        start();

        toast.success('Liveness verification started');

        return;
      }

      attempts += 1;

      if (!cancelled && attempts < 80) {

        requestAnimationFrame(startRecording);
      }
    };

    startRecording();

    return () => {

      cancelled = true;
    };

  }, [mediaReady, recorder, sessionStarted, start]);

  const stopCamera = useCallback(() => {

    const stream =
      webcamRef.current?.stream ||
      webcamRef.current?.video?.srcObject;

    if (stream?.getTracks) {

      stream.getTracks().forEach((track) => track.stop());
    }

    setDetectorEnabled(false);

  }, []);

  // SUCCESS NAVIGATION
  useEffect(() => {

    if (!completed) return;

    stopCamera();

    toast.success('Verification Successful');

    recorder.stop((blob) => {

      const url = blob
        ? URL.createObjectURL(blob)
        : null;

      navigate('/recording', {
        state: {
          previewUrl: url,
          fileName: 'kyc-verification.webm',
        },
      });
    });

  }, [completed, recorder, stopCamera, navigate]);

  useEffect(() => {

    return () => stopCamera();

  }, [stopCamera]);

  const currentSuccessText = useMemo(() => {

    const labels = {

      blink: '✓ Eye Blink Detected',

      head_right: '✓ Right Movement Detected',

      head_left: '✓ Left Movement Detected',
    };

    return labels[currentStep.id] ?? '';

  }, [currentStep.id]);

  const progressText = useMemo(() => {

    if (completed) {

      return '100% complete';
    }

    return `${Math.round(((stepIndex + 1) / steps.length) * 100)}% complete`;

  }, [completed, stepIndex, steps.length]);

  const onRestart = () => {

    recorder.reset();

    recorderStartedRef.current = false;

    setDetectorEnabled(false);

    setMediaReady(false);

    setSessionStarted(true);

    restart();

    setCameraStatus('Restarting verification...');
  };

  const onBack = () => {

    stopCamera();

    recorder.stop();

    recorder.reset();

    navigate('/');
  };

  const onRecordingPreview = () => {

    toast('Verification must complete before viewing the recording.');
  };

  return (

    <div className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto max-w-xl">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-2 border-sky-400 bg-white p-6 shadow-xl"
        >

          {}

          <WebcamFeed
            ref={webcamRef}
            mirrored
            width={360}
            height={270}
            onReady={() => setMediaReady(true)}
            onError={() => {

              toast.error('Camera permission denied');

              navigate('/');
            }}
            className="mx-auto h-[270px] w-[360px]"
          />

          <FaceDetection
            videoRef={webcamRef}
            enabled={detectorEnabled}
            onDetect={handleDetect}
          />

          <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wide text-sky-700">

            {progressText} • {sessionSeconds}s

          </p>

          {spoofWarning && (

            <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700">

              ⚠ {spoofWarning}

            </div>
          )}

          {completed ? (

            <SuccessScreen />

          ) : (

            <LivenessInstruction
              instruction={currentStep.instruction}
              successText={currentSuccessText}
              isDetected={detectedStepId === currentStep.id}
            />
          )}

          <p className="mt-3 text-center text-sm text-slate-700">

            {statusText}

          </p>

          <p className="mt-1 text-center text-xs text-slate-500">

            {cameraStatus}

          </p>

          <VerificationButtons
            onRestart={onRestart}
            onBack={onBack}
            onRecording={onRecordingPreview}
          />

        </motion.div>

      </div>

    </div>
  );
}

export default KYCVerificationPage;