import axios from 'axios';

/**
 * Shared Axios instance for KYC APIs. Point `REACT_APP_API_BASE_URL` at your gateway.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  timeout: 120_000,
});

/**
 * Upload liveness selfie video as multipart/form-data.
 * @param {{ file: Blob; sessionId: string; timestamp: number }} payload
 */
export async function uploadKycVideo({ file, sessionId, timestamp }) {
  const formData = new FormData();
  formData.append('video', file, 'liveness-session.webm');
  formData.append('timestamp', String(timestamp));
  formData.append('sessionId', sessionId);

  return api.post('/api/kyc/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export default api;
