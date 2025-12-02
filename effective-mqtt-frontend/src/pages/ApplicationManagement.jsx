import React, { useState, useEffect } from 'react';
import './ApplicationManagement.css';
import { submitApplication, listApplications } from '../services/appRegistry';

const ApplicationManagement = () => {
  const [form, setForm] = useState({ name: '', code: '', description: '', link: '', expiry: '' });
  const [apps, setApps] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setApps(listApplications());
  }, []);

  const handleSubmit = () => {
    setError(null);
    setResult(null);
    try {
      const app = submitApplication(form);
      setResult(app);
      setApps(listApplications());
      setForm({ name: '', code: '', description: '', link: '', expiry: '' });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="app-management">
      <h1>应用申请管理</h1>
      <section className="form-section">
        <div className="form-row">
          <input placeholder="应用名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="应用 code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
        <input placeholder="链接地址 (如应用官网或接入文档)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        <input type="date" placeholder="到期日期" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
        <textarea placeholder="应用描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button onClick={handleSubmit}>提交申请</button>
        {error && <div className="error">{error}</div>}
      </section>

      {result && (
        <section className="result-section">
          <h2>申请成功</h2>
          <div className="kv"><span>应用名称:</span><span>{result.name}</span></div>
          <div className="kv"><span>应用 code:</span><span>{result.code}</span></div>
          {result.link && <div className="kv"><span>链接:</span><a href={result.link} target="_blank" rel="noreferrer">{result.link}</a></div>}
          {result.expiry && <div className="kv"><span>到期时间:</span><span>{new Date(result.expiry).toLocaleDateString()}</span></div>}
          <div className="kv"><span>AK:</span><code>{result.ak}</code></div>
          <div className="kv"><span>SK:</span><code>{result.sk}</code></div>
          <small>请妥善保管 AK/SK，用于连接 MQTT 服务端身份认证。</small>
        </section>
      )}

      <section className="list-section">
        <h2>已申请应用</h2>
        <table className="apps-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>code</th>
              <th>链接</th>
              <th>AK</th>
              <th>SK</th>
              <th>到期时间</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.code}</td>
                <td>{a.link ? (<a href={a.link} target="_blank" rel="noreferrer">{a.link}</a>) : '-'}</td>
                <td>{a.expiry ? new Date(a.expiry).toLocaleDateString() : '-'}</td>
                <td><code>{a.ak}</code></td>
                <td><code>{a.sk}</code></td>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>暂无应用</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ApplicationManagement;
