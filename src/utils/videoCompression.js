export const DEFAULT_RECORDING_CONFIG = {
  width: 640,
  height: 480,
  frameRate: 20,
  videoBitsPerSecond: 350_000,
  mimeType: 'video/webm;codecs=vp8',
};


export async function optimizeVideoBlob(blob, options = {}) {
  if (!blob) return null;
  const targetType = options.mimeType || DEFAULT_RECORDING_CONFIG.mimeType;
  const normalized = blob.type === targetType ? blob : new Blob([blob], { type: targetType });
  return normalized;
}
