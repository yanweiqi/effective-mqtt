import React, { useEffect, useState } from 'react';
import './Login.css';
import { createLoginSession, pollLoginStatus, resetLogin } from '../services/wechatAuth';
import { loginWithPassword, getSession, logout } from '../services/auth';
import { sendCode, verifyCode } from '../services/smsAuth';

const Login = () => {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState('INIT');
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [mode, setMode] = useState('account'); // 'account' | 'sms' | 'wechat'
  const [sms, setSms] = useState({ phone: '', code: '' });
  const [cooldown, setCooldown] = useState(0);

  // Init QR and restore session
  useEffect(() => {
    const { id, qrUrl } = createLoginSession();
    setQr({ id, url: qrUrl });
    setStatus('PENDING');

    const session = getSession();
    if (session) {
      setUser({ nickname: session.username, avatar: 'https://via.placeholder.com/64' });
      setStatus('SUCCESS');
    }
  }, []);

  // WeChat polling only in wechat mode
  useEffect(() => {
    if (!qr || mode !== 'wechat') return;
    let timer = setInterval(() => {
      const res = pollLoginStatus(qr.id);
      setStatus(res.status);
      if (res.user) setUser(res.user);
      if (res.status === 'SUCCESS' || res.status === 'EXPIRED') {
        clearInterval(timer);
        timer = null;
      }
    }, 1500);
    return () => { if (timer) clearInterval(timer); };
  }, [mode, qr]);

  // SMS cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleAccountLogin = async () => {
    try {
      setError('');
      const res = await loginWithPassword(account.username.trim(), account.password.trim());
      setUser({ nickname: res.user.username, avatar: 'https://via.placeholder.com/64' });
      setStatus('SUCCESS');
    } catch (e) { setError(e.message); }
  };

  const restart = () => {
    resetLogin();
    const { id, qrUrl } = createLoginSession();
    setQr({ id, url: qrUrl });
    setStatus('PENDING');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setStatus('INIT');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>登录</h1>
        {mode === 'account' && (
          <div className="account-box">
            <input placeholder="账号" value={account.username} onChange={(e) => setAccount({ ...account, username: e.target.value })} />
            <input type="password" placeholder="密码" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} />
            <button onClick={handleAccountLogin}>登录</button>
            {error && <div className="status status-error">{error}</div>}
          </div>
        )}

        {mode === 'sms' && (
          <div className="sms-box">
            <div className="sms-row">
              <input placeholder="手机号" value={sms.phone} onChange={(e) => setSms({ ...sms, phone: e.target.value })} />
              <button disabled={cooldown > 0} onClick={() => {
                try {
                  setError('');
                  sendCode(sms.phone.trim());
                  setCooldown(60);
                } catch (e) { setError(e.message); }
              }}>{cooldown > 0 ? `重发(${cooldown}s)` : '发送验证码'}</button>
            </div>
            <div className="sms-row">
              <input placeholder="验证码" value={sms.code} onChange={(e) => setSms({ ...sms, code: e.target.value })} />
              <button onClick={() => {
                try {
                  setError('');
                  const res = verifyCode(sms.phone.trim(), sms.code.trim());
                  setUser({ nickname: res.user.username, avatar: 'https://via.placeholder.com/64' });
                  setStatus('SUCCESS');
                } catch (e) { setError(e.message); }
              }}>短信登录</button>
            </div>
          </div>
        )}

        {mode === 'wechat' && (
          <div className="wechat-box">
            {qr && (<img className="qr" src={qr.url} alt="WeChat QR" />)}
            <div className={`status status-${status.toLowerCase()}`}>
              {status === 'PENDING' && '请使用微信扫码'}
              {status === 'SCANNED' && '已扫码，请在手机上确认'}
              {status === 'SUCCESS' && '登录成功'}
              {status === 'EXPIRED' && '二维码已过期，请重试'}
            </div>
            <div className="actions">
              <button onClick={restart}>重新获取二维码</button>
            </div>
          </div>
        )}

        {/* 其它登录方式统一放底部 */}
        <div className="other-login">
          <span className="other-label">其它登录方式</span>
          <div className="icon-group">
            <button className="icon-button wechat" onClick={() => setMode('wechat')}>微信</button>
            <button className="icon-button sms" onClick={() => setMode('sms')}>短信</button>
          </div>
        </div>

        {user && (
          <div className="user-info">
            <img src={user.avatar} alt="avatar" />
            <span>{user.nickname}</span>
            <button className="secondary" onClick={handleLogout}>退出登录</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
