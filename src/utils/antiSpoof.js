/**
 * Frontend anti-spoofing heuristics.
 *
 * These checks raise the effort bar for common presentation attacks:
 *   - Printed photo (hard copy)
 *   - Screen/soft-copy photo
 *   - Video replay
 *   - Camera blocked
 *   - Face switching mid-session
 *
 * None of these are cryptographically secure — pair with server-side
 * anti-spoof models for production KYC.
 */

// ---------------------------------------------------------------------------
// Camera-blocked detection
// ---------------------------------------------------------------------------

/**
 * If average brightness is extremely low AND a face was previously detected,
 * the lens is likely covered.
 */
export function isCameraBlocked(brightness) {
  if (brightness == null) return false;
  return brightness < 8; // near-black frame
}

// ---------------------------------------------------------------------------
// Overexposure detection
// ---------------------------------------------------------------------------

export function isOverExposed(brightness) {
  if (brightness == null) return false;
  return brightness > 230;
}

// ---------------------------------------------------------------------------
// Static / frozen landmark detection  (photo / screen replay)
// ---------------------------------------------------------------------------

/**
 * Accumulates per-landmark variance over a rolling window.
 * A real face has continuous micro-jitter from breathing, muscle tone, etc.
 * A printed photo or screen replay has near-zero variance.
 *
 * Returns { variance, isStatic }
 */
export function createStaticDetectorState() {
  return {
    samples: [],   // last N nose positions
    frameCount: 0,
  };
}

const STATIC_WINDOW   = 40;   // frames to accumulate
const STATIC_MIN_VAR  = 3e-7; // below this → suspiciously static

export function updateStaticDetector(state, landmarks) {
  if (!landmarks?.length) return { state, variance: 0, isStatic: false };

  const nose = landmarks[4];
  const next = {
    frameCount: state.frameCount + 1,
    samples: [...state.samples, { x: nose.x, y: nose.y }].slice(-STATIC_WINDOW),
  };

  if (next.samples.length < STATIC_WINDOW) {
    return { state: next, variance: 0, isStatic: false };
  }

  const mx = next.samples.reduce((s, p) => s + p.x, 0) / next.samples.length;
  const my = next.samples.reduce((s, p) => s + p.y, 0) / next.samples.length;
  let acc = 0;
  next.samples.forEach((p) => { acc += (p.x - mx) ** 2 + (p.y - my) ** 2; });
  const variance = acc / next.samples.length;

  // Only flag after enough frames so we don't false-positive on startup
  const isStatic = next.frameCount >= STATIC_WINDOW && variance < STATIC_MIN_VAR;

  return { state: next, variance, isStatic };
}

// ---------------------------------------------------------------------------
// Face consistency / face-switching detection
// ---------------------------------------------------------------------------

/**
 * Captures a compact face signature (inter-landmark ratios) on the first
 * stable frame and compares every subsequent frame against it.
 * A significantly different signature → different person appeared.
 */
export function createFaceConsistencyState() {
  return { signature: null };
}

/** Extract 6 normalised ratio features that are identity-stable. */
function extractFaceSignature(landmarks) {
  const le  = landmarks[33];   // left eye outer
  const re  = landmarks[263];  // right eye outer
  const nos = landmarks[4];    // nose tip
  const mou = landmarks[13];   // upper lip centre
  const lc  = landmarks[61];   // left mouth corner
  const rc  = landmarks[291];  // right mouth corner
  const chi = landmarks[152];  // chin

  const eyeDist  = Math.hypot(re.x - le.x, re.y - le.y) || 1e-6;
  const faceH    = Math.hypot(nos.x - chi.x, nos.y - chi.y) || 1e-6;

  return [
    Math.hypot(nos.x - le.x, nos.y - le.y) / eyeDist,
    Math.hypot(nos.x - re.x, nos.y - re.y) / eyeDist,
    Math.hypot(mou.x - nos.x, mou.y - nos.y) / faceH,
    Math.hypot(lc.x  - rc.x,  lc.y  - rc.y)  / eyeDist,
    Math.hypot(chi.x - mou.x, chi.y - mou.y) / faceH,
    eyeDist / faceH,
  ];
}

function sigDist(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) d += (a[i] - b[i]) ** 2;
  return Math.sqrt(d);
}

const MISMATCH_THRESHOLD = 0.28; // tuned empirically

export function updateFaceConsistency(state, landmarks) {
  if (!landmarks?.length) return { state, mismatch: false };

  const sig = extractFaceSignature(landmarks);

  if (!state.signature) {
    return { state: { signature: sig }, mismatch: false };
  }

  const dist     = sigDist(sig, state.signature);
  const mismatch = dist > MISMATCH_THRESHOLD;

  return { state, mismatch };
}

// ---------------------------------------------------------------------------
// Replay-attack timing gate
// ---------------------------------------------------------------------------

/**
 * Each challenge step must be completed within a window.
 * Too fast → likely a pre-recorded video that was edited to match.
 * Too slow → timeout (handled separately in the hook).
 *
 * Returns true if the elapsed time is suspiciously fast.
 */
const MIN_STEP_MS = 800; // a real human needs at least this long

export function isSuspiciouslyFast(stepStartTs) {
  return Date.now() - stepStartTs < MIN_STEP_MS;
}
