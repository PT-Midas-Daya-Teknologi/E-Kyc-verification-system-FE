import { useFaceDetection } from '../hooks/useFaceDetection';


function FaceDetection({ videoRef, enabled, onDetect, onReady }) {
  useFaceDetection(videoRef, { enabled, onDetect, onReady });
  return null;
}

export default FaceDetection;
