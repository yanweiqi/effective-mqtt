import React from 'react';
import './Content.css';

const Content = ({ children }) => {
  return (
    <main className="content">
      <div className="content-wrapper">
        {children || (
          <div className="welcome-container">
            <h2>欢迎使用 Effective MQTT</h2>
            <p>这是一个强大的 MQTT 管理平台</p>
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h3>快速连接</h3>
                <p>轻松管理多个 MQTT 服务器连接</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>实时监控</h3>
                <p>实时查看消息流和连接状态</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>安全可靠</h3>
                <p>支持多种认证方式和加密传输</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3>数据分析</h3>
                <p>提供详细的统计分析和报表</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Content;
