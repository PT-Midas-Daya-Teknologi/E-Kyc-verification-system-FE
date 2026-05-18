

export function isCameraBlocked(brightness) {
  if (brightness == null) return false;
  return brightness < 8; // near-black frame
}


export function isOverExposed(brightness) {
  if (brightness == null) return false;
  return brightness > 230;
}


export function createStaticDetectorState() {
  return {
    samples: [],   
    frameCount: 0,
  };
}

const STATIC_WINDOW   = 40;   
const STATIC_MIN_VAR  = 3e-7; 
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

  const isStatic = next.frameCount >= STATIC_WINDOW && variance < STATIC_MIN_VAR;

  return { state: next, variance, isStatic };
}


export function createFaceConsistencyState() {
  return { signature: null };
}

function extractFaceSignature(landmarks) {
  const le  = landmarks[33];   
  const re  = landmarks[263];  
  const nos = landmarks[4];    
  const mou = landmarks[13];   
  const lc  = landmarks[61];   
  const rc  = landmarks[291];  
  const chi = landmarks[152];  
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

const MISMATCH_THRESHOLD = 0.28; 

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


const MIN_STEP_MS = 800; 

export function isSuspiciouslyFast(stepStartTs) {
  return Date.now() - stepStartTs < MIN_STEP_MS;
}
