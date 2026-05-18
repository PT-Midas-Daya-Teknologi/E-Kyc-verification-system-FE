const IDX = {
  nose: 4,           
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
 
  
  const yaw = (distLeft - distRight) / eyeDist;
 
  const faceHeight = Math.hypot(fore.x - chin.x, fore.y - chin.y) || 1e-6;
  const faceMidY   = (fore.y + chin.y) / 2;
  const pitch      = (nose.y - faceMidY) / faceHeight;
 
  return { yaw, pitch, eyeDist, nose };
}
 
export function createHeadPoseStepState() {
  return {
    baselineYaw: null,
    baselinePitch: null,
    warmupFrames: 0,
    warmupYawSum: 0,
    sustainedGood: 0,
  };
}
 
const WARMUP_TARGET  = 10;  
const YAW_THRESHOLD  = 0.16; 
const YAW_RESET_BAND = 0.06; 
const SUSTAIN_FRAMES = 4;   
 

export function updateHeadPoseStep(state, landmarks, action, mirrorVideo) {
  const sig = estimateHeadSignals(landmarks);
  if (!sig) return { state, ok: false };
 
  let next = { ...state };
 
  const yaw = mirrorVideo ? -sig.yaw : sig.yaw;
 
  if (next.warmupFrames < WARMUP_TARGET) {
    next.warmupFrames  += 1;
    next.warmupYawSum  += yaw;
    if (next.warmupFrames === WARMUP_TARGET) {
      next.baselineYaw = next.warmupYawSum / WARMUP_TARGET;
    }
    return { state: next, ok: false };
  }
 
  const delta = yaw - next.baselineYaw;
 
  let hit = false;
  if (action === 'head_right') hit = delta >  YAW_THRESHOLD;
  if (action === 'head_left')  hit = delta < -YAW_THRESHOLD;
 
  
  let clearHit = false;
  if (action === 'head_right') clearHit = delta <  (YAW_THRESHOLD - YAW_RESET_BAND);
  if (action === 'head_left')  clearHit = delta > -(YAW_THRESHOLD - YAW_RESET_BAND);
 
  if (hit)           next.sustainedGood += 1;
  else if (clearHit) next.sustainedGood  = 0;
 
  const ok = next.sustainedGood >= SUSTAIN_FRAMES;
 
  return { state: next, ok };
}