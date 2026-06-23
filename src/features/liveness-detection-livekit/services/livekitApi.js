import apiClient from '../../../services/apiClient';

/**
 * Fetches a LiveKit token for the current KYC session.
 * GET /api/livekit/token?room=...&identity=...
 */
export async function getLiveKitToken(roomName, identity) {
  const { data } = await apiClient.get('/api/livekit/token', {
    params: { 
      room: roomName,
      identity: identity
    }
  });
  return data.token; // Expecting { token: "..." }
}
