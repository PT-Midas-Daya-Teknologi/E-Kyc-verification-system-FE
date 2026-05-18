
const LC = 61;   
const RC = 291;  
const UPPER_LIP  = 13;
const LOWER_LIP  = 14;

const LEFT_CHEEK  = 234;
const RIGHT_CHEEK = 454;

function dist(landmarks, a, b) {
  const A = landmarks[a];
  const B = landmarks[b];
  return Math.hypot(A.x - B.x, A.y - B.y);
}


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
const SMILE_DELTA_THRESHOLD  = 0.055; 
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
const MOUTH_DELTA_THRESHOLD  = 0.06; 
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
