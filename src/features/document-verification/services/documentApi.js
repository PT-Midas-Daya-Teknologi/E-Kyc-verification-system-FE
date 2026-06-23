import apiClient from '../../../services/apiClient';

/**
 * Initiates a KYC session for a given username.
 * POST /kyc/initiate?username=...
 */
export async function initiateKycSession(username) {
  const { data } = await apiClient.post(`/kyc/initiate`, null, {
    params: { username }
  });
  return data;
}

/**
 * Uploads a document for verification.
 * POST /kyc/upload
 */
export async function uploadDocument(file, documentType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);

  const { data } = await apiClient.post('/kyc/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}
