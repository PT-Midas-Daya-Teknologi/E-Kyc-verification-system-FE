export const DEFAULT_RECORDING_CONFIG = {
  width: 640,
  height: 480,
  frameRate: 20,
  videoBitsPerSecond: 350_000,
  mimeType: 'video/webm;codecs=vp8',
};

/**
 * Keep payload small while preserving acceptable KYC review quality.
 * Browser MediaRecorder already performs codec compression; this helper
 * normalizes the final blob type and can be extended for worker-based transcode.
 */
export async function optimizeVideoBlob(blob, options = {}) {
  if (!blob) return null;
  const targetType = options.mimeType || DEFAULT_RECORDING_CONFIG.mimeType;
  const normalized = blob.type === targetType ? blob : new Blob([blob], { type: targetType });
  return normalized;
}
