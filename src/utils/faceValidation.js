/**
 * Face presence, framing, approximate distance, and simple motion checks
 * to discourage static-image replay attempts.
 */

const IDX = {
  nose: 1,
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  chin: 152,
  forehead: 10,
};

/** Bounding metrics in normalized landmark space (0–1). */
export function getFaceBoundingMetrics(landmarks) {
  if (!landmarks?.length) return null;

  let minX = 1;
  let maxX = 0;
  let minY = 1;
  let maxY = 0;

  for (let i = 0; i < landmarks.length; i += 2) {
    const p = landmarks[i];
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return { minX, maxX, minY, maxY, width, height, cx, cy };
}

/** Circular/elliptical guide in normalized coords; default matches UI overlay. */
export function isFaceInsideGuide(
  landmarks,
  {
    centerX = 0.5,
    centerY = 0.42,
    radiusX = 0.22,
    radiusY = 0.3,
  } = {}
) {
  const nose = landmarks?.[IDX.nose];
  if (!nose) return false;
  const dx = (nose.x - centerX) / radiusX;
  const dy = (nose.y - centerY) / radiusY;
  return dx * dx + dy * dy <= 1;
}

/** Heuristic: face too small in frame → user too far. */
export function isFaceTooFar(landmarks, minWidth = 0.26) {
  const m = getFaceBoundingMetrics(landmarks);
  if (!m) return true;
  return m.width < minWidth;
}

/** Sample average luma from a downsized frame (0–255). */
export function sampleVideoBrightness(videoEl, canvas) {
  if (!videoEl || videoEl.readyState < 2 || !canvas) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = 48;
  const h = 48;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(videoEl, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  let sum = 0;
  const n = w * h;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return sum / n;
}

export function isLowLighting(brightness, threshold = 42) {
  if (brightness == null) return false;
  return brightness < threshold;
}

export function isOverExposed(brightness, threshold = 230) {
  if (brightness == null) return false;
  return brightness > threshold;
}

/** Maintain rolling variance of nose position for motion sanity checks. */
export function pushMotionSample(bufferRef, pt, maxLen = 24) {
  const buf = bufferRef.current;
  buf.push({ x: pt.x, y: pt.y });
  while (buf.length > maxLen) buf.shift();

  if (buf.length < 10) return { variance: 0 };

  const mx = buf.reduce((s, p) => s + p.x, 0) / buf.length;
  const my = buf.reduce((s, p) => s + p.y, 0) / buf.length;
  let acc = 0;
  buf.forEach((p) => {
    acc += (p.x - mx) ** 2 + (p.y - my) ** 2;
  });
  const variance = acc / buf.length;
  return { variance };
}

/** During motion prompts require subtle continuous motion — blocks frozen uploads. */
export function motionGateForStep(stepKind, variance, minVariance = 1.5e-5) {
  if (
    stepKind === 'head_left' ||
    stepKind === 'head_right' ||
    stepKind === 'look_up' ||
    stepKind === 'look_down' ||
    stepKind === 'smile'
  ) {
    return variance >= minVariance;
  }
  return true;
}
