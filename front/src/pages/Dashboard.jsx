import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentPrice, fetchHistoricalData } from '../store/slices/marketDataSlice';
import PriceChart from '../components/charts/PriceChart';
import './Dashboard.css'; // 确保创建这个文件

const Dashboard = () => {
  const dispatch = useDispatch();
  const { currentPrice, priceChange24h, loading, error, timeframe, lastUpdated } = useSelector(state => state.marketData || {});
  const { totalInvested, totalBtcAmount, profitLoss, profitLossPercentage } = useSelector(state => state.position || {});
  
  // 价格动画状态
  const [priceFlash, setPriceFlash] = useState(false);
  const [priceDirection, setPriceDirection] = useState(null); // 'up' 或 'down'
  const prevPriceRef = useRef(null);
  
  // 默认值处理
  const safeCurrentPrice = currentPrice || 0;
  const safePriceChange24h = priceChange24h || 0;
  const safeTotalInvested = totalInvested || 0;
  const safeTotalBtcAmount = totalBtcAmount || 0;
  const safeProfitLoss = profitLoss || 0;
  const safeProfitLossPercentage = profitLossPercentage || 0;
  
  // 格式化上次更新时间
  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    
    if (diffSeconds < 5) return '刚刚更新';
    if (diffSeconds < 60) return `${diffSeconds}秒前更新`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}分钟前更新`;
    
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}更新`;
  };
  
  // 监听价格变化，添加动画效果
  useEffect(() => {
    if (currentPrice && prevPriceRef.current && currentPrice !== prevPriceRef.current) {
      // 设置价格变化方向
      setPriceDirection(currentPrice > prevPriceRef.current ? 'up' : 'down');
      
      // 触发闪烁动画
      setPriceFlash(true);
      
      // 1秒后关闭闪烁效果
      const timer = setTimeout(() => {
        setPriceFlash(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // 更新上一次价格引用
    prevPriceRef.current = currentPrice;
  }, [currentPrice]);
  
  // 组件挂载时获取价格数据
  useEffect(() => {
    // 初始加载时获取数据
    dispatch(fetchCurrentPrice());
    dispatch(fetchHistoricalData(timeframe));
    
    // 设置定时刷新价格数据 - 我们在App.jsx中已经设置了全局定时器
    // 这里只是为了确保在切换到Dashboard时立即获取最新数据
  }, [dispatch, timeframe]);

  return (
    <div className="dashboard">
      <h1>BTC定投仪表盘</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="card p-4">
          <h3 className="text-tertiary mb-2">BTC当前价格</h3>
          <div className={`price-display ${priceFlash ? `flash-${priceDirection}` : ''}`}>
            <span className="current-price">
              {safeCurrentPrice ? `$${safeCurrentPrice.toLocaleString()}` : '加载中...'}
              {priceDirection && <span className={`price-arrow ${priceDirection}`}>{priceDirection === 'up' ? '↑' : '↓'}</span>}
            </span>
            {safePriceChange24h !== 0 && (
              <span className={`price-change ${safePriceChange24h >= 0 ? 'positive' : 'negative'}`}>
                {safePriceChange24h >= 0 ? '+' : ''}{safePriceChange24h.toFixed(2)}%
              </span>
            )}
            <div className="last-updated">{formatLastUpdated()}</div>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="text-tertiary mb-2">我的BTC持仓</h3>
          <div className="position-display">
            <span className="btc-amount">{safeTotalBtcAmount ? `${safeTotalBtcAmount.toFixed(8)} BTC` : '未持仓'}</span>
            <span className="invested-amount">投入: {safeTotalInvested ? `$${safeTotalInvested.toLocaleString()}` : '$0'}</span>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="text-tertiary mb-2">收益状况</h3>
          <div className="profit-display">
            {safeProfitLoss !== 0 ? (
              <>
                <span className={`profit-amount ${safeProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                  {safeProfitLoss >= 0 ? '+' : ''}{`$${Math.abs(safeProfitLoss).toLocaleString()}`}
                </span>
                <span className={`profit-percentage ${safeProfitLossPercentage >= 0 ? 'positive' : 'negative'}`}>
                  ({safeProfitLossPercentage >= 0 ? '+' : ''}{safeProfitLossPercentage.toFixed(2)}%)
                </span>
              </>
            ) : (
              <span>暂无数据</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="card p-4">
          <h3 className="mb-3">BTC价格走势</h3>
          {loading && !currentPrice ? (
            <div className="chart-placeholder" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
              <p>加载中...</p>
            </div>
          ) : error ? (
            <div className="chart-placeholder" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
              <p>加载失败: {error}</p>
            </div>
          ) : (
            <PriceChart containerHeight={400} />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="card p-4">
          <h3 className="mb-3">定投历史</h3>
          <div className="history-container">
            {/* 定投历史将在后续实现 */}
            <p>暂无定投记录</p>
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="mb-3">定投策略</h3>
          <div className="strategy-container">
            {/* 定投策略将在后续实现 */}
            <p>尚未设置定投策略</p>
            <button className="btn-primary mt-3">创建策略</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
