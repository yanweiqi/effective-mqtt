// Mock WeChat scan login service: generates a QR url and simulates polling

let currentSession = null;

export function createLoginSession() {
  const id = Math.random().toString(36).slice(2);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=wechat-login-${id}`;
  currentSession = { id, status: 'PENDING', qrUrl };
  return { id, qrUrl };
}

export function pollLoginStatus(id) {
  // Simulate scan -> confirm after some polls
  if (!currentSession || currentSession.id !== id) {
    return { status: 'EXPIRED' };
  }
  // Randomly progress to SCANNED then SUCCESS
  if (currentSession.status === 'PENDING' && Math.random() > 0.6) {
    currentSession.status = 'SCANNED';
  } else if (currentSession.status === 'SCANNED' && Math.random() > 0.6) {
    currentSession.status = 'SUCCESS';
  }
  return { status: currentSession.status, user: currentSession.status === 'SUCCESS' ? { nickname: 'WeChatUser', avatar: 'https://via.placeholder.com/64' } : null };
}

export function resetLogin() { currentSession = null; }
