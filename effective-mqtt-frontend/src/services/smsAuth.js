// Mock SMS auth service: send code and verify

let lastCode = null;
let lastPhone = null;
let expiresAt = 0;

export function sendCode(phone) {
  if (!phone || !/^\d{6,}$/.test(phone)) {
    throw new Error('请输入有效的手机号');
  }
  lastPhone = phone;
  lastCode = (Math.floor(Math.random() * 900000) + 100000).toString();
  expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes
  // In real case: call SMS provider
  return { sent: true, codePreview: lastCode.slice(0, 2) + '***' }; // preview for demo
}

export function verifyCode(phone, code) {
  if (!phone || !code) throw new Error('请输入手机号和验证码');
  if (Date.now() > expiresAt) throw new Error('验证码已过期');
  if (phone !== lastPhone) throw new Error('手机号不匹配');
  if (code !== lastCode) throw new Error('验证码不正确');
  return { success: true, user: { username: `sms_${phone}` } };
}
