import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, disconnectWallet } from '../../store/slices/walletSlice';
import './WalletConnect.css';

const WalletConnect = () => {
  const dispatch = useDispatch();
  const { address, isConnected } = useSelector((state) => state.wallet);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // 检查是否有保存的钱包连接，但不自动弹出连接请求
    const checkConnection = async () => {
      if (window.aptos && window.aptos.isConnected) {
        try {
          // 只检查是否已连接，不主动请求连接
          const account = await window.aptos.account();
          if (account) {
            dispatch(connectWallet({
              address: account.address,
              publicKey: account.publicKey
            }));
          }
        } catch (error) {
          console.error('检查钱包连接状态失败:', error);
        }
      }
    };

    checkConnection();
  }, [dispatch]);

  const handleConnect = async () => {
    if (!window.aptos) {
      alert('请安装Aptos钱包扩展');
      return;
    }

    try {
      const response = await window.aptos.connect();
      dispatch(connectWallet({
        address: response.address,
        publicKey: response.publicKey
      }));
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };

  const handleDisconnect = () => {
    if (window.aptos) {
      window.aptos.disconnect();
    }
    dispatch(disconnectWallet());
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <button className="connect-button" onClick={handleConnect}>
          连接钱包
        </button>
      ) : (
        <div className="wallet-info">
          <button className="address-button" onClick={toggleDropdown}>
            <span className="wallet-icon">👛</span>
            <span className="address">{formatAddress(address)}</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item address-full">
                <span className="label">地址:</span>
                <span className="value">{address}</span>
              </div>
              <button className="dropdown-item disconnect" onClick={handleDisconnect}>
                断开连接
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
