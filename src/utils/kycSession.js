const SESSION_KEY = 'kyc_session_id';
const attemptKey = (sessionId) => `kyc_attempt_count_${sessionId}`;

export function saveKycSessionId(sessionId) {
  if (!sessionId) return;
  localStorage.setItem(SESSION_KEY, sessionId);
  localStorage.setItem(attemptKey(sessionId), '0');
}

export function getKycSessionId() {
  return localStorage.getItem(SESSION_KEY);
}

export function resetAttemptCount(sessionId) {
  if (!sessionId) return;
  localStorage.setItem(attemptKey(sessionId), '0');
}

export function getAttemptCount(sessionId) {
  if (!sessionId) return 0;
  const raw = localStorage.getItem(attemptKey(sessionId));
  const parsed = Number.parseInt(raw ?? '0', 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function setAttemptCount(sessionId, count) {
  if (!sessionId) return;
  localStorage.setItem(attemptKey(sessionId), String(count));
}
