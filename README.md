# Active Liveness Verification (React + MediaPipe Face Mesh)

Production-style **frontend-only** flow for guided KYC selfies: blink, head turns, gaze shifts, smile, continuous face tracking, session recording (`MediaRecorder`), and multipart upload scaffolding via Axios.

## Quick start

```bash
npm install
cp .env.example .env.development.local
npm start
```

Open [http://localhost:3000](http://localhost:3000). Use **HTTPS on real devices** so `getUserMedia` is reliable.

## Environment

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_BASE_URL` | Origin of your backend (no trailing slash). Example: `http://localhost:3001` |

The upload helper posts to `${REACT_APP_API_BASE_URL}/api/kyc/upload` with `video`, `timestamp`, and `sessionId` fields (`multipart/form-data`).

## npm scripts

- `npm start` — dev server
- `npm test` — Jest / Testing Library
- `npm run build` — optimized bundle in `build/`

## Architecture (high level)

- `src/hooks/useFaceDetection.js` — MediaPipe `@mediapipe/face_mesh` loop + framing heuristics.
- `src/hooks/useLivenessCheck.js` — timed instruction orchestration & retries.
- `src/hooks/useVideoRecorder.js` — `MediaRecorder` session capture (WebM).
- `src/utils/*` — EAR blink scoring, pose proxies, smile ratio, passive checks (distance / lighting / motion variance).
- `src/pages/KYCVerification.jsx` — wires UI, recorder, uploads, and guidance overlays.

Models download WASM bundles from jsDelivr on first inference — keep users online for the initial load.

## Security notes (frontend bounds)

Browser-only checks **cannot** cryptographically defeat presentation attacks; they raise the effort bar via motion sequencing, lighting checks, oval framing, and continuous landmark jitter requirements. Pair this UI with **server-side** face anti-spoof models and velocity fraud checks.

## Learn More (CRA defaults)

This project bootstraps with [Create React App](https://github.com/facebook/create-react-app). See CRA docs for deployment, testing, and troubleshooting.
