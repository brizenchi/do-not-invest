import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Layout from './components/layout/Layout';
import { useTheme } from './contexts/ThemeContext';
import { fetchCurrentPrice, fetchHistoricalData } from './store/slices/marketDataSlice';
import { store } from './store'; // 导入store以访问当前状态

// 使用懒加载减轻初始加载负担
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InvestmentStrategy = lazy(() => import('./pages/InvestmentStrategy'));
const PositionHistory = lazy(() => import('./pages/PositionHistory'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>出现了一个错误</h2>
          <p>请刷新页面或联系支持团队</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '8px 16px',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 加载中组件
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column'
  }}>
    <div style={{ 
      width: '50px', 
      height: '50px', 
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <p style={{ marginTop: '20px' }}>加载中...</p>
  </div>
);

const App = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth || { isAuthenticated: false });
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 在组件挂载时获取初始数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 获取当前价格和历史数据
        await Promise.all([
          dispatch(fetchCurrentPrice()),
          dispatch(fetchHistoricalData('1d'))
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeData();
    
    // 每10秒更新一次当前价格，实现更实时的价格显示
    const priceInterval = setInterval(() => {
      dispatch(fetchCurrentPrice());
    }, 10000); // 从60秒减少到10秒
    
    // 每3分钟更新一次历史数据，保持图表最新
    const historyInterval = setInterval(() => {
      // 获取当前选中的时间周期
      const currentTimeframe = store.getState().marketData.timeframe || '1d';
      dispatch(fetchHistoricalData(currentTimeframe));
    }, 180000); // 3分钟
    
    return () => {
      clearInterval(priceInterval);
      clearInterval(historyInterval);
    };
  }, [dispatch]);

  // 如果数据还没有初始化完成，显示加载中
  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return (
    <div className={`app ${theme}`}>
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/strategy" element={<InvestmentStrategy />} />
              <Route path="/history" element={<PositionHistory />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </div>
  );
};

export default App;
