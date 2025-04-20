import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleApp from './SimpleApp';

// 创建根元素
const root = ReactDOM.createRoot(document.getElementById('root'));

// 渲染简化版应用
root.render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);
