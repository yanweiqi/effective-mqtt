// Simple mock auth service for account login

const TOKEN_KEY = 'effective-mqtt-token';

export function loginWithPassword(username, password) {
  if (!username || !password) {
    throw new Error('请输入账号和密码');
  }
  // Demo: accept any non-empty, but reject very short passwords
  if (password.length < 4) {
    throw new Error('密码长度至少为 4 位');
  }
  const token = `tok_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, user: { username } }));
  return { token, user: { username } };
}

export function getSession() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}
