import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import { updateNotificationSettings } from '../store/slices/notificationSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { settings: notificationSettings } = useSelector(state => state.notification);
  
  const [settings, setSettings] = useState({
    currency: 'USD',
    language: 'zh-CN',
    ...notificationSettings
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setSettings({
      ...settings,
      [name]: newValue
    });
    
    // 如果是通知设置，则更新Redux状态
    if (Object.keys(notificationSettings).includes(name)) {
      dispatch(updateNotificationSettings({ [name]: newValue }));
    }
  };

  return (
    <div className="settings">
      <h1>设置</h1>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="card p-4">
          <h2 className="mb-3">应用设置</h2>
          
          <div className="form-group mb-3">
            <label htmlFor="theme">主题</label>
            <div className="theme-selector flex items-center mt-1">
              <span className={`theme-option ${theme === 'light' ? 'active' : ''}`}>浅色</span>
              <button 
                className={`theme-toggle-switch ${theme === 'dark' ? 'active' : ''}`}
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="toggle-handle"></span>
              </button>
              <span className={`theme-option ${theme === 'dark' ? 'active' : ''}`}>深色</span>
            </div>
          </div>
          
          <div className="form-group mb-3">
            <label htmlFor="language">语言</label>
            <select
              id="language"
              name="language"
              value={settings.language}
              onChange={handleChange}
              className="form-control"
            >
              <option value="zh-CN">中文 (简体)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
          
          <div className="form-group mb-3">
            <label htmlFor="currency">货币单位</label>
            <select
              id="currency"
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              className="form-control"
            >
              <option value="USD">美元 (USD)</option>
              <option value="CNY">人民币 (CNY)</option>
              <option value="EUR">欧元 (EUR)</option>
              <option value="JPY">日元 (JPY)</option>
            </select>
          </div>
        </div>
        
        <div className="card p-4">
          <h2 className="mb-3">通知设置</h2>
          
          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="priceAlerts"
              name="priceAlerts"
              checked={settings.priceAlerts}
              onChange={handleChange}
              className="form-check-input"
            />
            <label htmlFor="priceAlerts" className="form-check-label">
              价格提醒
            </label>
            <p className="form-text">当BTC价格达到您设置的阈值时通知您</p>
          </div>
          
          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="strategyExecutions"
              name="strategyExecutions"
              checked={settings.strategyExecutions}
              onChange={handleChange}
              className="form-check-input"
            />
            <label htmlFor="strategyExecutions" className="form-check-label">
              策略执行通知
            </label>
            <p className="form-text">当您的定投策略执行时通知您</p>
          </div>
          
          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="systemUpdates"
              name="systemUpdates"
              checked={settings.systemUpdates}
              onChange={handleChange}
              className="form-check-input"
            />
            <label htmlFor="systemUpdates" className="form-check-label">
              系统更新通知
            </label>
            <p className="form-text">接收系统更新和新功能通知</p>
          </div>
          
          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
              className="form-check-input"
            />
            <label htmlFor="emailNotifications" className="form-check-label">
              电子邮件通知
            </label>
            <p className="form-text">通过电子邮件接收通知</p>
          </div>
          
          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="pushNotifications"
              name="pushNotifications"
              checked={settings.pushNotifications}
              onChange={handleChange}
              className="form-check-input"
            />
            <label htmlFor="pushNotifications" className="form-check-label">
              推送通知
            </label>
            <p className="form-text">通过浏览器推送接收通知</p>
          </div>
        </div>
        
        <div className="card p-4">
          <h2 className="mb-3">账户设置</h2>
          
          <div className="wallet-info mb-3">
            <h3 className="text-tertiary mb-1">连接的钱包</h3>
            <p className="wallet-address">未连接钱包</p>
          </div>
          
          <button className="btn-danger">断开连接</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
