import { useCallback, useRef, useState } from 'react';

function pickRecorderMimeType(preferred) {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [preferred, 'video/webm;codecs=vp8', 'video/webm'];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

/**
 * Wraps MediaRecorder for the webcam stream.
 * `stop(onReady)` accepts a callback that fires with the finished Blob
 * once onstop has fully assembled all chunks — eliminating the async race
 * where callers read `previewUrl` before onstop has fired.
 */
export function useVideoRecorder(
  config = { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 250000 }
) {
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const mimeRef          = useRef('');
  const onReadyRef       = useRef(null);

  const [recording, setRecording] = useState(false);

  const reset = useCallback(() => {
    chunksRef.current = [];
    mimeRef.current   = '';
    onReadyRef.current = null;
    mediaRecorderRef.current = null;
    setRecording(false);
  }, []);

  const start = useCallback((stream) => {
    if (!stream) return;
    chunksRef.current = [];
    mimeRef.current   = pickRecorderMimeType(config.mimeType);

    const recorder = mimeRef.current
      ? new MediaRecorder(stream, {
          mimeType: mimeRef.current,
          videoBitsPerSecond: config.videoBitsPerSecond,
        })
      : new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const type = mimeRef.current || 'video/webm';
      const videoBlob = new Blob(chunksRef.current, { type });
      setRecording(false);
      // Fire the callback registered by stop() with the finished blob
      onReadyRef.current?.(videoBlob);
      onReadyRef.current = null;
    };

    mediaRecorderRef.current = recorder;
    recorder.start(250);
    setRecording(true);
  }, [config.mimeType, config.videoBitsPerSecond]);

  /**
   * Stop recording. `onReady(blob)` is called once onstop has fired
   * and the Blob is fully assembled — safe to navigate from inside it.
   */
  const stop = useCallback((onReady) => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === 'inactive') {
      onReady?.(null);
      return;
    }
    onReadyRef.current = onReady ?? null;
    mr.stop();
  }, []);

  return { start, stop, reset, recording };
}
