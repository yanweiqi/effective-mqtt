import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: '仪表板', icon: '📊' },
    { id: 'connections', label: '连接管理', icon: '🔌' },
    { id: 'topics', label: '主题管理', icon: '📝' },
    { id: 'messages', label: '消息监控', icon: '💬' },
    { id: 'clients', label: '客户端管理', icon: '👥' },
    { id: 'statistics', label: '统计分析', icon: '📈' },
    { id: 'settings', label: '系统设置', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => setActiveMenu(item.id)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">
              {item.id === 'topics' ? (
                <Link to="/topics">主题管理</Link>
              ) : (
                item.label
              )}
            </span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
