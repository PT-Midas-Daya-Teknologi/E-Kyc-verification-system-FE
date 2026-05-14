import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createBlinkDetectorState,
  updateBlinkDetector,
} from '../utils/blinkDetection';
import { createHeadPoseStepState, updateHeadPoseStep } from '../utils/headMovement';
import {
  isCameraBlocked,
  isSuspiciouslyFast,
  createStaticDetectorState,
  updateStaticDetector,
  createFaceConsistencyState,
  updateFaceConsistency,
} from '../utils/antiSpoof';

// ---------------------------------------------------------------------------
// Full step pool
// ---------------------------------------------------------------------------

const STEP_POOL = [
  { id: 'blink',      kind: 'blink',      instruction: 'Please blink your eyes' },
  { id: 'head_right', kind: 'head_right', instruction: 'Move your head to the right' },
  { id: 'head_left',  kind: 'head_left',  instruction: 'Move your head to the left' },
];

/**
 * Fisher-Yates shuffle then pick `count` unique steps.
 * Blink is always included — it's the cheapest baseline calibration step.
 * The remaining slots are filled from the other 4 at random.
 */
function buildRandomSteps(count = 3) {
  const others = STEP_POOL.filter((s) => s.id !== 'blink');
  // Fisher-Yates shuffle on the non-blink pool
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const picked = [STEP_POOL[0], ...others.slice(0, count - 1)];
  // Shuffle the full picked array so blink isn't always first
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked;
}

// ---------------------------------------------------------------------------
// Spoof warning messages
// ---------------------------------------------------------------------------

export const SPOOF_MESSAGES = {
  multiple_faces: 'Multiple faces detected. Only one person should be visible.',
  no_face:        'No face detected. Please stay in frame.',
  low_light:      'Lighting is too low. Please improve lighting.',
  overexposed:    'Camera exposure too high. Reduce bright light behind you.',
  camera_blocked: 'Camera appears blocked. Please uncover the lens.',
  static_face:    'Static image detected. Please use a real face in front of the camera.',
  face_mismatch:  'Face mismatch detected. Please do not switch persons.',
  too_fast:       'Action completed too quickly. Please follow instructions naturally.',
  too_far:        'Move closer to the camera.',
  not_centered:   'Keep your face inside the guide oval.',
};

const SUCCESS_LABELS = {
  blink:      '✓ Eye Blink Detected',
  head_right: '✓ Right Movement Detected',
  head_left:  '✓ Left Movement Detected',
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLivenessDetection({ mirroredPreview = true }) {
  const stepsRef = useRef(buildRandomSteps());

  const [stepIndex,      setStepIndex]      = useState(0);
  const [statusText,     setStatusText]     = useState('Waiting for face...');
  const [completed,      setCompleted]      = useState(false);
  const [detectedStepId, setDetectedStepId] = useState(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [spoofWarning,   setSpoofWarning]   = useState(null);

  // Refs — synchronously readable inside processFrame (no stale closures)
  const stepIndexRef     = useRef(0);
  const completedRef     = useRef(false);
  const transitioningRef = useRef(false);
  const startTsRef       = useRef(0);
  const stepStartTsRef   = useRef(0);

  // Per-step detector refs
  const blinkRef = useRef(createBlinkDetectorState());
  const headRef  = useRef(createHeadPoseStepState());

  // Anti-spoof refs
  const staticRef      = useRef(createStaticDetectorState());
  const consistencyRef = useRef(createFaceConsistencyState());
  const lastWarnRef    = useRef({ code: null, ts: 0 });

  // Debounced warning setter — avoids re-rendering every frame for the same code
  const setWarn = useCallback((code) => {
    const now = Date.now();
    if (lastWarnRef.current.code === code && now - lastWarnRef.current.ts < 2000) return;
    lastWarnRef.current = { code, ts: now };
    setSpoofWarning(code ? SPOOF_MESSAGES[code] : null);
  }, []);

  const clearWarn = useCallback(() => {
    if (!lastWarnRef.current.code) return;
    lastWarnRef.current = { code: null, ts: 0 };
    setSpoofWarning(null);
  }, []);

  const syncStepIndex = useCallback((idx) => {
    stepIndexRef.current = idx;
    setStepIndex(idx);
  }, []);

  const resetStepDetectors = useCallback(() => {
    blinkRef.current  = createBlinkDetectorState();
    headRef.current   = createHeadPoseStepState();
    staticRef.current = createStaticDetectorState();
    setDetectedStepId(null);
    transitioningRef.current = false;
    stepStartTsRef.current   = Date.now();
  }, []);

  const start = useCallback(() => {
    stepsRef.current       = buildRandomSteps();
    completedRef.current   = false;
    setCompleted(false);
    setStatusText('Align your face in the frame');
    setSpoofWarning(null);
    lastWarnRef.current    = { code: null, ts: 0 };
    startTsRef.current     = Date.now();
    setSessionSeconds(0);
    consistencyRef.current = createFaceConsistencyState();
    syncStepIndex(0);
    resetStepDetectors();
  }, [syncStepIndex, resetStepDetectors]);

  const restart = useCallback(() => { start(); }, [start]);

  useEffect(() => {
    if (!startTsRef.current || completed) return undefined;
    const id = window.setInterval(() => {
      setSessionSeconds(Math.floor((Date.now() - startTsRef.current) / 1000));
    }, 500);
    return () => window.clearInterval(id);
  }, [completed]);

  // For rendering only — never read inside processFrame
  const currentStep = stepsRef.current[stepIndex] ?? stepsRef.current[stepsRef.current.length - 1];

  const markStepSuccess = useCallback((stepId) => {
    if (transitioningRef.current) return;
    if (isSuspiciouslyFast(stepStartTsRef.current)) { setWarn('too_fast'); return; }

    transitioningRef.current = true;
    clearWarn();
    setDetectedStepId(stepId);
    setStatusText(SUCCESS_LABELS[stepId] ?? '');

    window.setTimeout(() => {
      const nextIdx = stepIndexRef.current + 1;
      if (nextIdx >= stepsRef.current.length) {
        completedRef.current = true;
        setCompleted(true);
        setStatusText('Verification Successful');
      } else {
        syncStepIndex(nextIdx);
        resetStepDetectors();
      }
    }, 900);
  }, [syncStepIndex, resetStepDetectors, setWarn, clearWarn]);

  // ---------------------------------------------------------------------------
  // Per-frame processor — anti-spoof gates → step detection
  // ---------------------------------------------------------------------------
  const processFrame = useCallback((frame) => {
    if (completedRef.current || transitioningRef.current) return;

    const { landmarks, faceCount, brightness, darkScene, overExposed, tooFar, insideGuide } = frame;

    // Environmental gates
    if (isCameraBlocked(brightness)) { setWarn('camera_blocked'); return; }
    if (overExposed)                  { setWarn('overexposed');    return; }
    if (darkScene)                    { setWarn('low_light');      return; }

    // Face presence gates
    if (faceCount === 0) { setWarn('no_face');        setStatusText('No face detected. Please stay in frame.'); return; }
    if (faceCount > 1)   { setWarn('multiple_faces'); setStatusText('Multiple faces detected.'); return; }
    if (!landmarks)      { return; }
    if (tooFar)          { setWarn('too_far');        return; }
    if (!insideGuide)    { setWarn('not_centered');   return; }

    // Static-image / replay gate
    const staticResult = updateStaticDetector(staticRef.current, landmarks);
    staticRef.current  = staticResult.state;
    if (staticResult.isStatic) { setWarn('static_face'); return; }

    // Face-switching gate
    const consistResult    = updateFaceConsistency(consistencyRef.current, landmarks);
    consistencyRef.current = consistResult.state;
    if (consistResult.mismatch) {
      setWarn('face_mismatch');
      setStatusText('Face mismatch detected. Verification failed.');
      return;
    }

    clearWarn();

    // Step detection — always read from ref, never from stale closure
    const step = stepsRef.current[stepIndexRef.current];
    if (!step) return;

    switch (step.kind) {
      case 'blink': {
        blinkRef.current = updateBlinkDetector(blinkRef.current, landmarks, Date.now());
        if (blinkRef.current.satisfied) markStepSuccess('blink');
        break;
      }
      case 'head_right':
      case 'head_left': {
        const { state, ok } = updateHeadPoseStep(headRef.current, landmarks, step.kind, mirroredPreview);
        headRef.current = state;
        if (ok) markStepSuccess(step.id);
        break;
      }
      default:
        break;
    }
  }, [markStepSuccess, mirroredPreview, setWarn, clearWarn]);

  return {
    steps: stepsRef.current,
    currentStep,
    stepIndex,
    statusText,
    detectedStepId,
    completed,
    sessionSeconds,
    spoofWarning,
    start,
    restart,
    processFrame,
  };
}
