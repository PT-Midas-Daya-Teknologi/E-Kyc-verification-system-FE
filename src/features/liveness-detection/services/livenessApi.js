import apiClient from '../../../services/apiClient';

/** POST /api/liveness/create-session → { sessionId } */
export async function createLivenessSession() {
  const { data } = await apiClient.post('/api/liveness/create-session');
  return data.sessionId;
}

/** GET /api/liveness/result/{awsSessionId}?kycSessionId= — merged AWS + Python result */
export async function getLivenessResult(awsSessionId, kycSessionId) {
  const { data } = await apiClient.get(`/api/liveness/result/${awsSessionId}`, {
    params: { kycSessionId },
    timeout: 60000,
  });
  return data;
}

/**
 * GET /api/liveness/credentials
 * Returns short-lived AWS credentials from Spring Boot (via STS).
 */
export async function getAwsCredentials() {
  const { data } = await apiClient.get('/api/liveness/credentials');
  return data; // { accessKeyId, secretAccessKey, sessionToken, region }
}

/** POST /api/liveness/upload — upload recorded WebM video */
export async function uploadVerificationVideo(videoBlob, sessionId) {
  const form = new FormData();
  form.append('video', videoBlob, 'verification-recording.webm');
  form.append('sessionId', sessionId);
  form.append('timestamp', new Date().toISOString());
  const { data } = await apiClient.post('/api/liveness/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** POST /api/liveness/upload-snapshot — upload single face snapshot for verification */
export async function uploadLivenessSnapshot(snapshotBlob, sessionId, kycSessionId) {
  const form = new FormData();
  form.append('snapshot', snapshotBlob, 'face-snapshot.jpg');
  form.append('sessionId', sessionId);
  form.append('kycSessionId', kycSessionId);
  form.append('timestamp', new Date().toISOString());

  const { data } = await apiClient.post('/api/liveness/upload-snapshot', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
