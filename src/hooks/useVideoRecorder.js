import { useCallback, useRef, useState } from 'react';

function pickRecorderMimeType(preferred) {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [preferred, 'video/webm;codecs=vp8', 'video/webm'];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}


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
      onReadyRef.current?.(videoBlob);
      onReadyRef.current = null;
    };

    mediaRecorderRef.current = recorder;
    recorder.start(250);
    setRecording(true);
  }, [config.mimeType, config.videoBitsPerSecond]);

  
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
