import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found text-center p-5">
      <h1 className="mb-4">404</h1>
      <h2 className="mb-3">页面未找到</h2>
      <p className="mb-4">抱歉，您请求的页面不存在。</p>
      <Link to="/" className="btn-primary">
        返回首页
      </Link>
    </div>
  );
};

export default NotFound;
