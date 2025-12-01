import React, { useState } from 'react';
import './TopicManagement.css';

const TopicManagement = () => {
  const [topics, setTopics] = useState([
    { id: 1, name: 'home/livingroom/temperature', description: 'Living room temperature sensor' },
    { id: 2, name: 'home/kitchen/humidity', description: 'Kitchen humidity sensor' },
  ]);

  const [newTopic, setNewTopic] = useState({ name: '', description: '' });

  const handleAddTopic = () => {
    if (newTopic.name.trim() && newTopic.description.trim()) {
      setTopics([
        ...topics,
        { id: topics.length + 1, name: newTopic.name, description: newTopic.description },
      ]);
      setNewTopic({ name: '', description: '' });
    }
  };

  const handleDeleteTopic = (id) => {
    setTopics(topics.filter((topic) => topic.id !== id));
  };

  return (
    <div className="topic-management">
      <h1>主题管理</h1>
      <div className="add-topic-form">
        <input
          type="text"
          placeholder="主题名称"
          value={newTopic.name}
          onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="主题描述"
          value={newTopic.description}
          onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
        />
        <button onClick={handleAddTopic}>添加主题</button>
      </div>
      <ul className="topic-list">
        {topics.map((topic) => (
          <li key={topic.id} className="topic-item">
            <div className="topic-info">
              <span className="topic-name">{topic.name}</span>
              <span className="topic-description">{topic.description}</span>
            </div>
            <button className="delete-btn" onClick={() => handleDeleteTopic(topic.id)}>
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopicManagement;
