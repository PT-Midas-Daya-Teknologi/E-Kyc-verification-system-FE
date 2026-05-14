/**
 * Head pose proxies from 2D MediaPipe Face Mesh landmarks.
 *
 * Yaw is derived from the nose-to-eye asymmetry ratio:
 *   yaw = (dist(nose, leftEyeOuter) - dist(nose, rightEyeOuter)) / eyeDist
 *
 * This is scale-invariant and produces large, clean deltas (±0.3–0.6) for
 * natural head turns, making it far more reliable than a simple nose-X offset.
 *
 * In raw (unmirrored) landmark space:
 *   head turns RIGHT → nose moves closer to rightEyeOuter → yaw goes NEGATIVE
 *   head turns LEFT  → nose moves closer to leftEyeOuter  → yaw goes POSITIVE
 *
 * When mirroredPreview=true the display is flipped but landmarks are NOT,
 * so we flip the sign so that "right" in the UI matches the user's right.
 */

const IDX = {
  nose: 4,           // nose tip — more stable than landmark 1
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  chin: 152,
  forehead: 10,
};

export function estimateHeadSignals(landmarks) {
  if (!landmarks?.length) return null;

  const nose = landmarks[IDX.nose];
  const le   = landmarks[IDX.leftEyeOuter];
  const re   = landmarks[IDX.rightEyeOuter];
  const chin = landmarks[IDX.chin];
  const fore = landmarks[IDX.forehead];

  const eyeDist   = Math.hypot(re.x - le.x, re.y - le.y) || 1e-6;
  const distLeft  = Math.hypot(nose.x - le.x, nose.y - le.y);
  const distRight = Math.hypot(nose.x - re.x, nose.y - re.y);

  // Positive → nose closer to left eye  → head turned left (in raw stream)
  // Negative → nose closer to right eye → head turned right (in raw stream)
  const yaw = (distLeft - distRight) / eyeDist;

  // Pitch: chin-to-forehead midpoint Y vs nose Y, normalised by face height
  const faceHeight = Math.hypot(fore.x - chin.x, fore.y - chin.y) || 1e-6;
  const faceMidY   = (fore.y + chin.y) / 2;
  const pitch      = (nose.y - faceMidY) / faceHeight;

  return { yaw, pitch, eyeDist, nose };
}

export function createHeadPoseStepState() {
  return {
    baselineYaw: null,
    baselinePitch: null,
    // Accumulate baseline over WARMUP_TARGET frames using a simple average
    warmupFrames: 0,
    warmupYawSum: 0,
    sustainedGood: 0,
  };
}

// Collect this many frames before locking the neutral baseline
const WARMUP_TARGET   = 20;
// How far yaw must deviate from baseline to count as a turn
const YAW_THRESHOLD   = 0.22;
// How many consecutive frames the threshold must be exceeded
const SUSTAIN_FRAMES  = 8;

/**
 * Call once per frame while a head-movement step is active.
 * action: 'head_left' | 'head_right'
 */
export function updateHeadPoseStep(state, landmarks, action, mirrorVideo) {
  const sig = estimateHeadSignals(landmarks);
  if (!sig) return { state, ok: false };

  let next = { ...state };

  // Raw-stream sign: positive yaw = head left, negative yaw = head right.
  // When the preview is mirrored the user sees the opposite, so flip.
  const yaw = mirrorVideo ? -sig.yaw : sig.yaw;

  // --- Phase 1: accumulate a stable neutral baseline ---
  if (next.warmupFrames < WARMUP_TARGET) {
    next.warmupFrames  += 1;
    next.warmupYawSum  += yaw;
    if (next.warmupFrames === WARMUP_TARGET) {
      next.baselineYaw = next.warmupYawSum / WARMUP_TARGET;
    }
    return { state: next, ok: false };
  }

  // --- Phase 2: measure delta from locked baseline ---
  const delta = yaw - next.baselineYaw;

  let hit = false;
  if (action === 'head_right') hit = delta >  YAW_THRESHOLD;
  if (action === 'head_left')  hit = delta < -YAW_THRESHOLD;

  next.sustainedGood = hit ? next.sustainedGood + 1 : Math.max(0, next.sustainedGood - 1);
  const ok = next.sustainedGood >= SUSTAIN_FRAMES;

  return { state: next, ok };
}
