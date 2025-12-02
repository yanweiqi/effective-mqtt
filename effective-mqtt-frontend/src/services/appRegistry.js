// Simple mock application registry using localStorage

const STORAGE_KEY = 'effective-mqtt-apps';

function loadApps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveApps(apps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function genKey(len = 24) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function submitApplication({ name, code, description, link, expiry }) {
  if (!name || !code) {
    throw new Error('应用名称和应用 code 不能为空');
  }
  const apps = loadApps();
  if (apps.find((a) => a.code === code)) {
    throw new Error('该应用 code 已存在');
  }
  const ak = genKey(20);
  const sk = genKey(32);
  const app = { id: Date.now(), name, code, description, link: link || '', expiry: expiry || '', ak, sk, createdAt: new Date().toISOString() };
  apps.push(app);
  saveApps(apps);
  return app;
}

export function listApplications() {
  return loadApps();
}
