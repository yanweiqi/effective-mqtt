import React, { useState, useEffect, useRef } from 'react';
import './TopicManagement.css';
import { initMqtt, subscribe, unsubscribe, publish, disconnect } from '../services/mqttClient';

const DEFAULT_BROKER = { host: 'localhost', port: 8083, protocol: 'ws' }; // Adjust to your broker WS listener

const TopicManagement = () => {
  const [connectionInfo, setConnectionInfo] = useState({
    host: DEFAULT_BROKER.host,
    port: DEFAULT_BROKER.port,
    protocol: DEFAULT_BROKER.protocol,
    clientId: '',
    username: '',
    password: ''
  });
  const [connected, setConnected] = useState(false);
  const [subFilter, setSubFilter] = useState('');
  const [subOptions, setSubOptions] = useState({ qos: 0, noLocal: false, retainAsPublished: false, retainHandling: 0 });
  const [subscriptions, setSubscriptions] = useState([]); // {filter, options}
  const [publishForm, setPublishForm] = useState({ topic: '', payload: '', qos: 0, retain: false, responseTopic: '', expiry: '', alias: '', contentType: '', formatIndicator: false });
  const [messageLog, setMessageLog] = useState([]); // {topic,payload,time,properties}
  const [error, setError] = useState(null);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messageLog]);

  const handleConnect = () => {
    setError(null);
    try {
      initMqtt({
        ...connectionInfo,
        onConnect: () => setConnected(true),
        onError: (err) => setError(err.message),
        onMessage: (msg) => {
          setMessageLog((prev) => [
            ...prev,
            {
              topic: msg.topic,
              payload: msg.payload,
              qos: msg.qos,
              retain: msg.retain,
              time: new Date().toLocaleTimeString(),
              properties: msg.properties
            }
          ]);
        }
      });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setConnected(false);
    setSubscriptions([]);
  };

  const handleSubscribe = () => {
    if (!subFilter.trim()) return;
    try {
      subscribe(subFilter.trim(), subOptions);
      setSubscriptions((prev) => [...prev, { filter: subFilter.trim(), options: { ...subOptions } }]);
      setSubFilter('');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUnsubscribe = (filter) => {
    unsubscribe(filter);
    setSubscriptions((prev) => prev.filter((s) => s.filter !== filter));
  };

  const handlePublish = () => {
    if (!publishForm.topic.trim()) return;
    try {
      publish(publishForm.topic.trim(), publishForm.payload, {
        qos: publishForm.qos,
        retain: publishForm.retain,
        responseTopic: publishForm.responseTopic || undefined,
        messageExpiryInterval: publishForm.expiry ? parseInt(publishForm.expiry, 10) : undefined,
        topicAlias: publishForm.alias ? parseInt(publishForm.alias, 10) : undefined,
        contentType: publishForm.contentType || undefined,
        payloadFormatIndicator: publishForm.formatIndicator ? 1 : undefined,
        userProperties: { ui: 'frontend', page: 'TopicManagement' }
      });
      setPublishForm({ ...publishForm, payload: '' });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="topic-management">
      <h1>MQTT 5 主题管理</h1>
      <section className="connection-section">
        <h2>连接</h2>
        <div className="connection-form">
          <input placeholder="Host" value={connectionInfo.host} onChange={(e) => setConnectionInfo({ ...connectionInfo, host: e.target.value })} />
          <input placeholder="Port" value={connectionInfo.port} onChange={(e) => setConnectionInfo({ ...connectionInfo, port: e.target.value })} />
          <input placeholder="Client ID(可选)" value={connectionInfo.clientId} onChange={(e) => setConnectionInfo({ ...connectionInfo, clientId: e.target.value })} />
          <input placeholder="用户名" value={connectionInfo.username} onChange={(e) => setConnectionInfo({ ...connectionInfo, username: e.target.value })} />
          <input placeholder="密码" type="password" value={connectionInfo.password} onChange={(e) => setConnectionInfo({ ...connectionInfo, password: e.target.value })} />
          {!connected ? (
            <button onClick={handleConnect}>连接</button>
          ) : (
            <button onClick={handleDisconnect}>断开</button>
          )}
        </div>
        {error && <div className="error">错误: {error}</div>}
      </section>

      <section className="subscribe-section">
        <h2>订阅</h2>
        <div className="subscribe-form">
          <input placeholder="主题过滤器 (支持通配符)" value={subFilter} onChange={(e) => setSubFilter(e.target.value)} />
          <select value={subOptions.qos} onChange={(e) => setSubOptions({ ...subOptions, qos: parseInt(e.target.value, 10) })}>
            <option value={0}>QoS 0</option>
            <option value={1}>QoS 1</option>
            <option value={2}>QoS 2</option>
          </select>
          <label><input type="checkbox" checked={subOptions.noLocal} onChange={(e) => setSubOptions({ ...subOptions, noLocal: e.target.checked })} /> noLocal</label>
          <label><input type="checkbox" checked={subOptions.retainAsPublished} onChange={(e) => setSubOptions({ ...subOptions, retainAsPublished: e.target.checked })} /> retainAsPublished</label>
          <select value={subOptions.retainHandling} onChange={(e) => setSubOptions({ ...subOptions, retainHandling: parseInt(e.target.value, 10) })}>
            <option value={0}>Retain Handling 0</option>
            <option value={1}>Retain Handling 1</option>
            <option value={2}>Retain Handling 2</option>
          </select>
          <button disabled={!connected} onClick={handleSubscribe}>订阅</button>
        </div>
        <ul className="subscription-list">
          {subscriptions.map((s) => (
            <li key={s.filter}>
              <span>{s.filter}</span>
              <span>QoS:{s.options.qos}</span>
              {s.options.noLocal && <span> noLocal</span>}
              {s.options.retainAsPublished && <span> RAP</span>}
              <span> RH:{s.options.retainHandling}</span>
              <button onClick={() => handleUnsubscribe(s.filter)}>取消</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="publish-section">
        <h2>发布</h2>
        <div className="publish-form">
          <input placeholder="主题" value={publishForm.topic} onChange={(e) => setPublishForm({ ...publishForm, topic: e.target.value })} />
          <textarea placeholder="消息内容" value={publishForm.payload} onChange={(e) => setPublishForm({ ...publishForm, payload: e.target.value })} />
          <select value={publishForm.qos} onChange={(e) => setPublishForm({ ...publishForm, qos: parseInt(e.target.value, 10) })}>
            <option value={0}>QoS 0</option>
            <option value={1}>QoS 1</option>
            <option value={2}>QoS 2</option>
          </select>
          <label><input type="checkbox" checked={publishForm.retain} onChange={(e) => setPublishForm({ ...publishForm, retain: e.target.checked })} /> 保留消息</label>
          <input placeholder="响应主题 (responseTopic)" value={publishForm.responseTopic} onChange={(e) => setPublishForm({ ...publishForm, responseTopic: e.target.value })} />
          <input placeholder="过期秒数 (messageExpiryInterval)" value={publishForm.expiry} onChange={(e) => setPublishForm({ ...publishForm, expiry: e.target.value })} />
          <input placeholder="主题别名 (topicAlias)" value={publishForm.alias} onChange={(e) => setPublishForm({ ...publishForm, alias: e.target.value })} />
          <input placeholder="内容类型 (contentType)" value={publishForm.contentType} onChange={(e) => setPublishForm({ ...publishForm, contentType: e.target.value })} />
          <label><input type="checkbox" checked={publishForm.formatIndicator} onChange={(e) => setPublishForm({ ...publishForm, formatIndicator: e.target.checked })} /> payloadFormatIndicator</label>
          <button disabled={!connected} onClick={handlePublish}>发布</button>
        </div>
      </section>

      <section className="messages-section">
        <h2>消息日志</h2>
        <div className="message-log" ref={logRef} style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '8px' }}>
          {messageLog.map((m, idx) => (
            <div key={idx} className="message-item">
              <div><strong>{m.time}</strong> [{m.topic}] QoS:{m.qos} {m.retain ? 'Retained' : ''}</div>
              <div>{m.payload}</div>
              {m.properties && (
                <div className="props">
                  <small>Props: {Object.keys(m.properties).map(k => `${k}`).join(', ')}</small>
                </div>
              )}
            </div>
          ))}
          {messageLog.length === 0 && <div>暂无消息</div>}
        </div>
      </section>
    </div>
  );
};

export default TopicManagement;
