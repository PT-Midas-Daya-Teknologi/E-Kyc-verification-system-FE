import { useFaceDetection } from '../hooks/useFaceDetection';

/**
 * Headless Face Mesh runner — renders nothing while pumping inference callbacks.
 */
function FaceDetection({ videoRef, enabled, onDetect, onReady }) {
  useFaceDetection(videoRef, { enabled, onDetect, onReady });
  return null;
}

export default FaceDetection;
