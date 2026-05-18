<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
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
>>>>>>> 8ff554a9a037140d8e671432bb5f361b27ef4dc6
