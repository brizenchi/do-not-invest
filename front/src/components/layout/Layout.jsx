import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import './Layout.css';
import WalletConnect from '../wallet/WalletConnect';

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-container">
          <div className="logo">
            <Link to="/">
              <h1>Do Not Invest</h1>
            </Link>
          </div>
          
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            <span className="menu-icon"></span>
          </button>
          
          <nav className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <ul>
              <li className={isActive('/')}>
                <Link to="/">仪表盘</Link>
              </li>
              <li className={isActive('/strategy')}>
                <Link to="/strategy">投资策略</Link>
              </li>
              <li className={isActive('/history')}>
                <Link to="/history">历史记录</Link>
              </li>
              <li className={isActive('/settings')}>
                <Link to="/settings">设置</Link>
              </li>
            </ul>
          </nav>
          
          <div className="header-actions">
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <WalletConnect />
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} BTC定投应用 - 基于Aptos区块链</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
