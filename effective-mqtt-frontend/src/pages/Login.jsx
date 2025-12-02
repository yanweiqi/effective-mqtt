import React, { useEffect, useState } from 'react';
import './Login.css';
import { createLoginSession, pollLoginStatus, resetLogin } from '../services/wechatAuth';
import { loginWithPassword, getSession, logout } from '../services/auth';

const Login = () => {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState('INIT');
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [mode, setMode] = useState('account'); // 'account' | 'wechat'

  useEffect(() => {
    // Prepare WeChat session (inactive until user switches to wechat mode)
    const { id, qrUrl } = createLoginSession();
    setQr({ id, url: qrUrl });
    setStatus('PENDING');

    let timer = null;
    const startWechatPolling = () => {
      if (timer) return;
      timer = setInterval(async () => {
        const res = pollLoginStatus(id);
        setStatus(res.status);
        if (res.user) setUser(res.user);
        if (res.status === 'SUCCESS' || res.status === 'EXPIRED') {
          clearInterval(timer);
          timer = null;
        }
      }, 1500);
    };

    // Start polling only when user selects WeChat mode
    if (mode === 'wechat') startWechatPolling();

    // Load existing account session if any
    const session = getSession();
    if (session?.user) {
      setUser({ nickname: session.user.username, avatar: 'https://via.placeholder.com/64' });
      setStatus('SUCCESS');
    }

    return () => { if (timer) clearInterval(timer); };
  }, [mode]);

  const restart = () => {
    resetLogin();
    setQr(null);
    setUser(null);
    setStatus('INIT');
    const { id, qrUrl } = createLoginSession();
    setQr({ id, url: qrUrl });
    setStatus('PENDING');
  };

  const handleAccountLogin = () => {
    try {
      setError('');
      const res = loginWithPassword(account.username.trim(), account.password);
      setUser({ nickname: res.user.username, avatar: 'https://via.placeholder.com/64' });
      setStatus('SUCCESS');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setStatus('PENDING');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>登录</h1>

        <div className="tabs">
          <button className={mode === 'account' ? 'tab active' : 'tab'} onClick={() => setMode('account')}>账号登录</button>
          <button className={mode === 'wechat' ? 'tab active' : 'tab'} onClick={() => setMode('wechat')}>微信扫码</button>
        </div>

        {mode === 'account' && (
          <div className="account-box">
            <input placeholder="账号" value={account.username} onChange={(e) => setAccount({ ...account, username: e.target.value })} />
            <input type="password" placeholder="密码" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} />
            <button onClick={handleAccountLogin}>登录</button>
            {error && <div className="status status-error">{error}</div>}
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
