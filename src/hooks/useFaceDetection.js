import { FaceMesh } from '@mediapipe/face_mesh';
import { useEffect, useRef, useState } from 'react';
import {
  isFaceInsideGuide,
  isFaceTooFar,
  isLowLighting,
  isOverExposed,
  sampleVideoBrightness,
} from '../utils/faceValidation';

function resolveVideoElement(videoRef) {
  const node = videoRef?.current;
  if (!node) return null;
  if (typeof HTMLVideoElement !== 'undefined' && node instanceof HTMLVideoElement) {
    return node;
  }
  if (node.video instanceof HTMLVideoElement) {
    return node.video;
  }
  return null;
}


export function useFaceDetection(videoRef, { enabled = true, onDetect, onReady } = {}) {
  const [modelReady, setModelReady] = useState(false);
  const [faceCount, setFaceCount] = useState(0);

  const canvasRef = useRef(null);
  const frameCounterRef = useRef(0);
  const readyRef = useRef(false);
  const onDetectRef = useRef(onDetect);
  const onReadyRef = useRef(onReady);

  onDetectRef.current = onDetect;
  onReadyRef.current = onReady;

  if (typeof document !== 'undefined' && !canvasRef.current) {
    canvasRef.current = document.createElement('canvas');
  }

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    let rafId = 0;
    /** @type {FaceMesh | null} */
    let faceMesh = null;

    const boot = async () => {
      faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 2,
        refineLandmarks: true,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });

      faceMesh.onResults((results) => {
        if (cancelled) return;

        const count = results.multiFaceLandmarks?.length ?? 0;
        const landmarks =
          count === 1 ? results.multiFaceLandmarks[0] : null;

        setFaceCount(count);

        const video = resolveVideoElement(videoRef);
        let brightness = null;
        frameCounterRef.current += 1;
        if (
          video &&
          video.readyState >= 2 &&
          canvasRef.current &&
          frameCounterRef.current % 12 === 0
        ) {
          brightness = sampleVideoBrightness(video, canvasRef.current);
        }

        const insideGuide  = landmarks ? isFaceInsideGuide(landmarks) : false;
        const tooFar        = landmarks ? isFaceTooFar(landmarks) : count !== 1;
        const darkScene     = isLowLighting(brightness);
        const overExposed   = isOverExposed(brightness);

        if (!readyRef.current) {
          readyRef.current = true;
          setModelReady(true);
          onReadyRef.current?.();
        }

        onDetectRef.current?.({
          landmarks,
          faceCount: count,
          brightness,
          insideGuide,
          tooFar,
          darkScene,
          overExposed,
        });
      });

      const loop = async () => {
        const video = resolveVideoElement(videoRef);
        if (!cancelled && video && video.readyState >= 2 && faceMesh) {
          await faceMesh.send({ image: video });
        }
        if (!cancelled) {
          rafId = requestAnimationFrame(loop);
        }
      };

      rafId = requestAnimationFrame(loop);
    };

    boot();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      faceMesh?.close?.();
      readyRef.current = false;
      setModelReady(false);
      setFaceCount(0);
    };
  }, [enabled, videoRef]);

  return {
    modelReady,
    faceCount,
  };
}
