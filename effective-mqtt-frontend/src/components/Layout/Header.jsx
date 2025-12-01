import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">Effective MQTT</h1>
      </div>
      <div className="header-right">
        <nav className="header-nav">
          <button className="nav-item">首页</button>
          <button className="nav-item">设置</button>
          <button className="nav-item">帮助</button>
        </nav>
        <div className="user-info">
          <span className="username">用户名</span>
          <button className="logout-btn">退出</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
