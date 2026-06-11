import axios from 'axios';

// When VITE_API_BASE_URL is empty, axios uses the current origin (localhost:3000)
// Vite proxy then forwards /api/* → http://localhost:8080
// This eliminates all CORS preflight issues in development
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
// passed token for liveness
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("kyc_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor — log errors for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      error.message = 'Cannot connect to backend. Make sure Spring Boot is running on port 8080.';
    }
    return Promise.reject(error);
  }
);

/** POST /api/liveness/create-session → { sessionId } */
export async function createLivenessSession() {
  const { data } = await api.post('/api/liveness/create-session');
  return data.sessionId;
}

/** GET /api/liveness/result/{awsSessionId}?kycSessionId= — merged AWS + Python result */
export async function getLivenessResult(awsSessionId, kycSessionId) {
  const { data } = await api.get(`/api/liveness/result/${awsSessionId}`, {
    params: { kycSessionId },
    timeout: 60000,
  });
  return data;
}

/**
 * GET /api/liveness/credentials
 * Returns short-lived AWS credentials from Spring Boot (via STS).
 * Passed as credentialProvider to FaceLivenessDetector — no Cognito needed.
 */
export async function getAwsCredentials() {
  const { data } = await api.get('/api/liveness/credentials');
  return data; // { accessKeyId, secretAccessKey, sessionToken, region }
}

/** POST /api/liveness/upload — upload recorded WebM video */
export async function uploadVerificationVideo(videoBlob, sessionId) {
  const form = new FormData();
  form.append('video', videoBlob, 'verification-recording.webm');
  form.append('sessionId', sessionId);
  form.append('timestamp', new Date().toISOString());
  const { data } = await api.post('/api/liveness/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** POST /api/liveness/upload-snapshot — upload single face snapshot for verification */
export async function uploadLivenessSnapshot(snapshotBlob, sessionId, kycSessionId) {
  console.log(
    '[API] uploadLivenessSnapshot START — sessionId:',
    sessionId,
    '| kycSessionId:',
    kycSessionId,
    '| snapshotSize:',
    snapshotBlob.size,
    'bytes | type:',
    snapshotBlob.type
  );

  const form = new FormData();
  form.append('snapshot', snapshotBlob, 'face-snapshot.jpg');
  form.append('sessionId', sessionId);
  form.append('kycSessionId', kycSessionId);
  form.append('timestamp', new Date().toISOString());

  try {
    console.log(
      '[API] Sending snapshot to backend...'
    );

    const { data } = await api.post('/api/liveness/upload-snapshot', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log(
      '[API] uploadLivenessSnapshot SUCCESS — Response:',
      JSON.stringify(data, null, 2)
    );

    return data;
  } catch (error) {
    console.error(
      '[API] uploadLivenessSnapshot FAILED — Error:',
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
}


