import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import TopicManagement from './pages/TopicManagement';
import './App.css';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/topics" element={<TopicManagement />} />
          <Route path="*" element={<div>欢迎使用 Effective MQTT</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
