/**
 * Smile and mouth-open detection from MediaPipe Face Mesh landmarks.
 *
 * Both detectors follow the same pattern as blinkDetection:
 *  1. Collect a neutral baseline over the first N frames.
 *  2. Measure the ratio change relative to that baseline.
 *  3. Require the change to persist for SUSTAIN_FRAMES consecutive frames.
 */

// ---------------------------------------------------------------------------
// Shared landmark indices
// ---------------------------------------------------------------------------

// Mouth corners
const LC = 61;   // left corner
const RC = 291;  // right corner

// Upper / lower lip mid-points
const UPPER_LIP  = 13;
const LOWER_LIP  = 14;

// Cheek reference points for normalisation (stable across expressions)
const LEFT_CHEEK  = 234;
const RIGHT_CHEEK = 454;

function dist(landmarks, a, b) {
  const A = landmarks[a];
  const B = landmarks[b];
  return Math.hypot(A.x - B.x, A.y - B.y);
}

// ---------------------------------------------------------------------------
// Smile detector
// ---------------------------------------------------------------------------

/**
 * Smile ratio = mouth width / face width.
 * Smiling stretches the corners outward → ratio increases.
 */
function computeSmileRatio(landmarks) {
  const mouthW = dist(landmarks, LC, RC);
  const faceW  = dist(landmarks, LEFT_CHEEK, RIGHT_CHEEK) || 1e-6;
  return mouthW / faceW;
}

export function createSmileDetectorState() {
  return {
    baselineSamples: [],
    baselineReady:   false,
    baselineRatio:   0.45,
    sustainedGood:   0,
    satisfied:       false,
  };
}

const SMILE_BASELINE_FRAMES  = 15;
const SMILE_DELTA_THRESHOLD  = 0.055; // ratio must rise by this much above baseline
const SMILE_SUSTAIN_FRAMES   = 10;

export function updateSmileDetector(state, landmarks) {
  if (!landmarks?.length) return state;

  const ratio = computeSmileRatio(landmarks);
  let next = { ...state };

  if (!next.baselineReady) {
    next.baselineSamples = [...next.baselineSamples, ratio].slice(-SMILE_BASELINE_FRAMES);
    if (next.baselineSamples.length >= SMILE_BASELINE_FRAMES) {
      const sorted = [...next.baselineSamples].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      next.baselineRatio =
        sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      next.baselineReady = true;
    }
    return next;
  }

  if (!next.satisfied) {
    const hit = ratio > next.baselineRatio + SMILE_DELTA_THRESHOLD;
    next.sustainedGood = hit
      ? next.sustainedGood + 1
      : Math.max(0, next.sustainedGood - 1);
    if (next.sustainedGood >= SMILE_SUSTAIN_FRAMES) {
      next.satisfied = true;
    }
  }

  return next;
}

// ---------------------------------------------------------------------------
// Mouth-open detector
// ---------------------------------------------------------------------------

/**
 * Mouth-open ratio = lip gap / face height.
 * Opening the mouth increases the vertical distance between upper and lower lip.
 */
function computeMouthOpenRatio(landmarks) {
  const lipGap  = dist(landmarks, UPPER_LIP, LOWER_LIP);
  const chin    = landmarks[152];
  const fore    = landmarks[10];
  const faceH   = Math.hypot(fore.x - chin.x, fore.y - chin.y) || 1e-6;
  return lipGap / faceH;
}

export function createMouthOpenDetectorState() {
  return {
    baselineSamples: [],
    baselineReady:   false,
    baselineRatio:   0.02,
    sustainedGood:   0,
    satisfied:       false,
  };
}

const MOUTH_BASELINE_FRAMES  = 15;
const MOUTH_DELTA_THRESHOLD  = 0.06; // ratio must rise by this much above baseline
const MOUTH_SUSTAIN_FRAMES   = 8;

export function updateMouthOpenDetector(state, landmarks) {
  if (!landmarks?.length) return state;

  const ratio = computeMouthOpenRatio(landmarks);
  let next = { ...state };

  if (!next.baselineReady) {
    next.baselineSamples = [...next.baselineSamples, ratio].slice(-MOUTH_BASELINE_FRAMES);
    if (next.baselineSamples.length >= MOUTH_BASELINE_FRAMES) {
      const sorted = [...next.baselineSamples].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      next.baselineRatio =
        sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      next.baselineReady = true;
    }
    return next;
  }

  if (!next.satisfied) {
    const hit = ratio > next.baselineRatio + MOUTH_DELTA_THRESHOLD;
    next.sustainedGood = hit
      ? next.sustainedGood + 1
      : Math.max(0, next.sustainedGood - 1);
    if (next.sustainedGood >= MOUTH_SUSTAIN_FRAMES) {
      next.satisfied = true;
    }
  }

  return next;
}
