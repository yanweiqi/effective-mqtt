import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Content from './Content';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <div className="layout-body">
        <Sidebar />
        <Content>{children}</Content>
      </div>
    </div>
  );
};

export default MainLayout;
