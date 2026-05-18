

const LEFT_EYE_IDX = {
  outer: 33,
  inner: 133,
  top: 159,
  bottom: 145,
  topInner: 158,
  bottomOuter: 153,
};

const RIGHT_EYE_IDX = {
  outer: 362,
  inner: 263,
  top: 386,
  bottom: 374,
  topInner: 385,
  bottomOuter: 380,
};

function landmarkDist(landmarks, a, b) {
  const A = landmarks[a];
  const B = landmarks[b];
  return Math.hypot(A.x - B.x, A.y - B.y);
}

export function computeEyeAspectRatio(landmarks) {
  const lv1 = landmarkDist(landmarks, LEFT_EYE_IDX.top, LEFT_EYE_IDX.bottom);
  const lv2 = landmarkDist(
    landmarks,
    LEFT_EYE_IDX.topInner,
    LEFT_EYE_IDX.bottomOuter
  );
  const lh = landmarkDist(landmarks, LEFT_EYE_IDX.outer, LEFT_EYE_IDX.inner);

  const rv1 = landmarkDist(landmarks, RIGHT_EYE_IDX.top, RIGHT_EYE_IDX.bottom);
  const rv2 = landmarkDist(
    landmarks,
    RIGHT_EYE_IDX.topInner,
    RIGHT_EYE_IDX.bottomOuter
  );
  const rh = landmarkDist(landmarks, RIGHT_EYE_IDX.outer, RIGHT_EYE_IDX.inner);

  const earLeft = lh > 1e-6 ? (lv1 + lv2) / (2 * lh) : 0;
  const earRight = rh > 1e-6 ? (rv1 + rv2) / (2 * rh) : 0;
  return { earLeft, earRight, earAvg: (earLeft + earRight) / 2 };
}


export function createBlinkDetectorState() {
  return {
    baselineSamples: [],
    baselineReady: false,
    baselineEar: 0.28,
    phase: 'open', 
    closedFrames: 0,
    satisfied: false,
    peakDrop: 0,
  };
}

const BASELINE_FRAMES = 12;
const CLOSED_THRESHOLD_RATIO = 0.72; 
const MIN_CLOSED_FRAMES = 2;
const REOPEN_RATIO = 0.88;
const ABS_CLOSED_CAP = 0.225;

export function updateBlinkDetector(state, landmarks, frameTs) {
  if (!landmarks?.length) return state;

  const { earAvg } = computeEyeAspectRatio(landmarks);
  let next = { ...state, lastTs: frameTs, lastEar: earAvg };

  if (!next.baselineReady) {
    next.baselineSamples = [...next.baselineSamples, earAvg].slice(
      -BASELINE_FRAMES
    );
    if (next.baselineSamples.length >= BASELINE_FRAMES) {
      const sorted = [...next.baselineSamples].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      next.baselineEar =
        sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      next.baselineReady = true;
    }
    return next;
  }

  const closedCutoff = Math.min(
    next.baselineEar * CLOSED_THRESHOLD_RATIO,
    ABS_CLOSED_CAP
  );
  const reopenLevel = Math.max(next.baselineEar * REOPEN_RATIO, closedCutoff + 0.02);

  if (!next.satisfied) {
    if (next.phase === 'open' && earAvg < closedCutoff) {
      next.phase = 'closing';
      next.closedFrames = 1;
      next.peakDrop = next.baselineEar - earAvg;
    } else if (next.phase === 'closing') {
      if (earAvg < closedCutoff) {
        next.closedFrames += 1;
        next.peakDrop = Math.max(next.peakDrop, next.baselineEar - earAvg);
      } else if (earAvg >= reopenLevel) {
        next.phase = 'open';
        if (
          next.closedFrames >= MIN_CLOSED_FRAMES &&
          next.peakDrop > 0.035
        ) {
          next.satisfied = true;
        }
        next.closedFrames = 0;
        next.peakDrop = 0;
      }
    }
  }

  return next;
}
