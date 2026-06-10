import { useEffect, useRef } from 'react';

const DEFAULT_WS_URL = 'ws://localhost:8000/ws';
const FRAME_INTERVAL_MS = 200;
const JPEG_QUALITY = 0.65;
const VIDEO_SELECTOR = '.liveness-detector video';
const MAX_RECONNECT_DELAY_MS = 10000;

/**
 * Streams frames from the Face Liveness video element to the Python WebSocket API.
 * Expects base64 data URLs: data:image/jpeg;base64,...
 */
export function useFrameWebSocket({ active, sessionId }) {
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const activeRef = useRef(active);

  activeRef.current = active;

  useEffect(() => {
    if (!active) {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      reconnectAttemptRef.current = 0;
      return undefined;
    }

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || DEFAULT_WS_URL;

    const captureAndSend = () => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const video = document.querySelector(VIDEO_SELECTOR);
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) return;

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      ws.send(dataUrl);
    };

    const startFrameLoop = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(captureAndSend, FRAME_INTERVAL_MS);
    };

    const scheduleReconnect = () => {
      if (!activeRef.current) return;
      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(1000 * 2 ** attempt, MAX_RECONNECT_DELAY_MS);
      reconnectAttemptRef.current = attempt + 1;
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    const connect = () => {
      if (!activeRef.current) return;

      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      try {
        
// websocket changes
        const token = localStorage.getItem("kyc_token");

const ws = new WebSocket(
  `${wsUrl}/${encodeURIComponent(token)}`
);


        wsRef.current = ws;

        ws.onopen = () => {
          reconnectAttemptRef.current = 0;
          if (sessionId) {
            console.log('[FrameWebSocket] Connected for session:', sessionId);
          }
          startFrameLoop();
        };

        ws.onmessage = () => {
          // Backend may reply "Frame Processed" — no UI impact
        };

        ws.onerror = () => {
          console.warn('[FrameWebSocket] Connection error');
        };

        ws.onclose = () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (activeRef.current) {
            scheduleReconnect();
          }
        };
      } catch (err) {
        console.warn('[FrameWebSocket] Failed to connect:', err.message);
        scheduleReconnect();
      }
    };

    connect();

    return () => {
      activeRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      canvasRef.current = null;
      reconnectAttemptRef.current = 0;
    };
  }, [active, sessionId]);
}
