
const MOUTH_LEFT = 61;
const MOUTH_RIGHT = 291;
const UPPER_LIP = 13;
const LOWER_LIP = 14;

function distLm(lm, i, j) {
  const a = lm[i];
  const b = lm[j];
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function computeSmileMetrics(landmarks) {
  if (!landmarks?.length) return null;

  const mouthWidth = distLm(landmarks, MOUTH_LEFT, MOUTH_RIGHT);
  const mouthOpen = distLm(landmarks, UPPER_LIP, LOWER_LIP);
  const eyeDist = distLm(landmarks, 33, 263);

  const smileRatio =
    eyeDist > 1e-6 ? mouthWidth / eyeDist : mouthWidth / 0.35;

  const opennessRatio =
    mouthOpen > 1e-6 ? mouthWidth / mouthOpen : smileRatio;

  return { smileRatio, opennessRatio, mouthWidth, mouthOpen, eyeDist };
}

export function createSmileStepState() {
  return {
    baselineRatio: null,
    baselineWidth: null,
    warmupFrames: 0,
    sustained: 0,
  };
}

const WARMUP = 15;
const RATIO_BOOST = 1.1;
const ABS_DELTA = 0.018;
const SUSTAIN = 12;

export function updateSmileStep(state, landmarks) {
  const m = computeSmileMetrics(landmarks);
  if (!m) return { state, ok: false };

  let next = { ...state };
  next.warmupFrames += 1;

  if (next.baselineRatio == null) {
    next.baselineRatio = m.smileRatio;
    next.baselineWidth = m.mouthWidth;
  }

  if (next.warmupFrames <= WARMUP) {
    next.baselineRatio += (m.smileRatio - next.baselineRatio) * 0.25;
    next.baselineWidth += (m.mouthWidth - next.baselineWidth) * 0.25;
    return { state: next, ok: false };
  }

  const ratioTarget = Math.max(
    next.baselineRatio * RATIO_BOOST,
    next.baselineRatio + ABS_DELTA
  );
  const widthOk = m.mouthWidth > next.baselineWidth * 1.06;
  const smiling = m.smileRatio >= ratioTarget && widthOk;

  next.sustained = smiling ? next.sustained + 1 : 0;
  return { state: next, ok: next.sustained >= SUSTAIN };
}
