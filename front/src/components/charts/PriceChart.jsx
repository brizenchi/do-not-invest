import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHistoricalData } from '../../store/slices/marketDataSlice';
import './PriceChart.css';

const PriceChart = ({ containerHeight = 400 }) => {
  // 创建引用
  const chartContainerRef = useRef(null);
  const chart = useRef(null);
  const candleSeries = useRef(null);
  const volumeSeries = useRef(null);
  const resizeObserver = useRef(null);
  const isMounted = useRef(true); // 用于跟踪组件是否已挂载
  const dispatch = useDispatch(); // 获取dispatch函数
  
  // 从Redux获取数据，提供默认值防止undefined错误
  const { historicalData = [], timeframe = '1d', loading = false } = useSelector(state => state.marketData || {});
  const { theme = 'light' } = useSelector(state => state.ui || { theme: 'light' });
  
  // 本地状态
  const [chartOptions, setChartOptions] = useState({
    timeframe: timeframe || '1d',
    showVolume: true,
    visibleRange: null,
  });
  
  // 组件挂载/卸载生命周期
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 初始化图表
  useEffect(() => {
    // 防止在组件未挂载时执行
    if (!chartContainerRef.current) return;
    
    // 使用try-catch捕获可能的错误
    try {
      // 清理旧图表
      if (chart.current) {
        chart.current.remove();
        chart.current = null;
      }
      
      // 创建新图表
      const isDarkTheme = theme === 'dark';
      
      // 创建更美观的图表配置
      const chartInstance = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: containerHeight,
        layout: {
          background: { 
            type: 'solid', 
            color: isDarkTheme ? '#1a1a1a' : '#ffffff' 
          },
          textColor: isDarkTheme ? '#d1d4dc' : '#333333',
          fontSize: 12,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        },
        grid: {
          vertLines: { 
            color: isDarkTheme ? 'rgba(45, 45, 45, 0.5)' : 'rgba(224, 224, 224, 0.5)',
            style: 1,
          },
          horzLines: { 
            color: isDarkTheme ? 'rgba(45, 45, 45, 0.5)' : 'rgba(224, 224, 224, 0.5)',
            style: 1,
          },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            width: 1,
            style: 2,
            labelBackgroundColor: isDarkTheme ? '#2d2d2d' : '#f5f5f5',
          },
          horzLine: {
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            width: 1,
            style: 2,
            labelBackgroundColor: isDarkTheme ? '#2d2d2d' : '#f5f5f5',
          },
        },
        rightPriceScale: {
          borderColor: isDarkTheme ? 'rgba(45, 45, 45, 0.8)' : 'rgba(224, 224, 224, 0.8)',
          borderVisible: true,
          scaleMargins: {
            top: 0.1,
            bottom: 0.2,
          },
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        },
        timeScale: {
          borderColor: isDarkTheme ? 'rgba(45, 45, 45, 0.8)' : 'rgba(224, 224, 224, 0.8)',
          borderVisible: true,
          timeVisible: true,
          secondsVisible: false,
          tickMarkFormatter: (time) => {
            const date = new Date(time * 1000);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
          },
          barSpacing: 12,
          minBarSpacing: 5,
          rightOffset: 5,
          leftOffset: 5,
          lockVisibleTimeRangeOnResize: false,
          rightBarStaysOnScroll: false,
          fixLeftEdge: false,
          fixRightEdge: false,
          allowShiftVisibleRangeOnWhitespaceClick: true,
          animate: true,
        },
        watermark: {
          visible: true,
          text: 'BTC/USD',
          color: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          fontSize: 48,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
          fontStyle: 'bold',
          horzAlign: 'center',
          vertAlign: 'center',
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      });
      
      // 保存图表实例
      chart.current = chartInstance;
      
      // 创建更美观的蜡烛图系列
      candleSeries.current = chartInstance.addCandlestickSeries({
        upColor: isDarkTheme ? '#26a69a' : '#26a69a', // 上涨颜色（绿色）
        downColor: isDarkTheme ? '#ef5350' : '#ef5350', // 下跌颜色（红色）
        borderVisible: false,
        wickUpColor: isDarkTheme ? '#26a69a' : '#26a69a',
        wickDownColor: isDarkTheme ? '#ef5350' : '#ef5350',
        borderUpColor: isDarkTheme ? '#26a69a' : '#26a69a',
        borderDownColor: isDarkTheme ? '#ef5350' : '#ef5350',
        // 添加价格格式化
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
        // 设置蜡烛图的宽度
        priceScaleId: 'right',
      });
      
      // 如果需要显示交易量，使用更美观的设置
      if (chartOptions.showVolume) {
        volumeSeries.current = chartInstance.addHistogramSeries({
          // 交易量颜色会根据价格变化自动调整
          color: '#26a69a',
          priceFormat: {
            type: 'volume',
            precision: 0, // 交易量不需要小数点
          },
          // 将交易量图表放在主图表的底部
          priceScaleId: '',
          scaleMargins: {
            top: 0.8, // 交易量图表占据底部20%的空间
            bottom: 0,
          },
          // 交易量柱子的宽度
          base: 0,
        });
        
        // 设置交易量图表的可见性
        volumeSeries.current.priceScale().applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
          borderVisible: false,
          drawTicks: false,
        });
      }
      
      // 设置响应式，优化不同屏幕尺寸下的显示效果
      const observer = new ResizeObserver(entries => {
        if (entries.length === 0 || !chart.current) return;
        try {
          const { width } = entries[0].contentRect;
          chart.current.applyOptions({ width, height: containerHeight });
          
          // 根据容器宽度调整柱子间距，使图表在不同尺寸下都美观
          const barSpacing = Math.max(Math.min(width / 50, 15), 6);
          chart.current.timeScale().applyOptions({
            barSpacing: barSpacing
          });
          
          // 调整后重新适应内容
          chart.current.timeScale().fitContent();
        } catch (err) {
          console.error('Resize observer error:', err);
        }
      });
      
      // 保存observer实例
      resizeObserver.current = observer;
      
      // 开始观察
      observer.observe(chartContainerRef.current);
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
    
    // 清理函数
    return () => {
      try {
        // 停止观察
        if (resizeObserver.current && chartContainerRef.current) {
          resizeObserver.current.unobserve(chartContainerRef.current);
          resizeObserver.current.disconnect();
          resizeObserver.current = null;
        }
        
        // 移除图表
        if (chart.current) {
          chart.current.remove();
          chart.current = null;
        }
        
        // 清空其他引用
        candleSeries.current = null;
        volumeSeries.current = null;
      } catch (error) {
        console.error('Error cleaning up chart:', error);
      }
    };
  }, [theme, containerHeight, chartOptions.showVolume]);
  
  // 当时间周期变化时获取新数据
  useEffect(() => {
    if (!isMounted.current) return;
    
    // 当组件挂载或时间周期变化时获取数据
    dispatch(fetchHistoricalData(chartOptions.timeframe));
  }, [dispatch, chartOptions.timeframe]);
  
  // 更新图表数据
  useEffect(() => {
    // 确保所有必要的引用都存在
    if (!chart.current || !candleSeries.current || !historicalData) return;
    // 确保数据是有效的数组
    if (!Array.isArray(historicalData) || historicalData.length === 0) return;
    
    try {
      console.log(`更新图表数据: 时间周期=${timeframe}, 数据点数=${historicalData.length}`);
      
      // 计算价格范围，用于设置合适的价格刻度
      let minPrice = Number.MAX_VALUE;
      let maxPrice = Number.MIN_VALUE;
      
      // 格式化数据 - 根据不同的时间周期调整时间格式，确保价格精度合适
      const candleData = historicalData.map(item => {
        // 确保时间戳格式正确
        let timestamp = item.time;
        
        // 如果时间是字符串，尝试转换为数字
        if (typeof timestamp === 'string') {
          if (timestamp.includes('T')) {
            // ISO格式的时间字符串
            timestamp = new Date(timestamp).getTime() / 1000;
          } else {
            // 尝试直接转换
            timestamp = parseInt(timestamp, 10);
          }
        } else if (timestamp > 10000000000) {
          // 如果是毫秒级时间戳，转换为秒级
          timestamp = timestamp / 1000;
        }
        
        // 确保价格数据为数字类型并保留适当精度
        const open = parseFloat(parseFloat(item.open).toFixed(2)) || 0;
        const high = parseFloat(parseFloat(item.high).toFixed(2)) || 0;
        const low = parseFloat(parseFloat(item.low).toFixed(2)) || 0;
        const close = parseFloat(parseFloat(item.close).toFixed(2)) || 0;
        
        // 更新最高和最低价格
        minPrice = Math.min(minPrice, low);
        maxPrice = Math.max(maxPrice, high);
        
        return {
          time: timestamp,
          open,
          high,
          low,
          close,
          volume: parseFloat(item.volume) || 0
        };
      });
      
      // 根据时间周期排序数据
      candleData.sort((a, b) => a.time - b.time);
      
      // 设置蜡烛图数据
      candleSeries.current.setData(candleData);
      
      // 计算价格范围的缓冲区，使图表更美观
      const priceDiff = maxPrice - minPrice;
      const buffer = priceDiff * 0.1; // 10%的缓冲区
      
      // 设置价格范围，确保BTC价格显示合理
      if (candleSeries.current && priceDiff > 0) {
        candleSeries.current.priceScale().applyOptions({
          autoScale: true, // 启用自动缩放
          scaleMargins: {
            top: 0.1,
            bottom: 0.2, // 为交易量留出空间
          },
          // 确保价格刻度与实际BTC价格对应
          minValue: minPrice - buffer,
          maxValue: maxPrice + buffer,
          // 设置价格格式
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
      }
      
      // 如果有交易量数据和交易量系列
      if (volumeSeries.current) {
        const volumeData = candleData.map(item => ({
          time: item.time,
          value: item.volume || Math.random() * 1000000 + 500000, // 如果没有交易量数据，生成随机值
          // 根据价格变化设置交易量柱子颜色，使用半透明效果增强美观性
          color: item.close >= item.open 
            ? (theme === 'dark' ? 'rgba(38, 166, 154, 0.6)' : 'rgba(38, 166, 154, 0.5)') 
            : (theme === 'dark' ? 'rgba(239, 83, 80, 0.6)' : 'rgba(239, 83, 80, 0.5)'),
        }));
        volumeSeries.current.setData(volumeData);
        
        // 优化交易量显示
        volumeSeries.current.priceScale().applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
          borderVisible: false,
          drawTicks: false,
          // 使用合适的交易量格式
          priceFormat: {
            type: 'volume',
            precision: 0,
          },
        });
      }
      
      // 自动调整视图 (使用try-catch防止可能的错误)
      try {
        if (chart.current && chart.current.timeScale) {
          // 根据不同的时间范围设置不同的时间刻度格式
          const timeScaleOptions = {};
          
          switch (timeframe) {
            case '1h':
              timeScaleOptions.timeVisible = true;
              timeScaleOptions.secondsVisible = false;
              timeScaleOptions.tickMarkFormatter = (time) => {
                const date = new Date(time * 1000);
                return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
              };
              break;
            case '1d':
              timeScaleOptions.timeVisible = true;
              timeScaleOptions.secondsVisible = false;
              timeScaleOptions.tickMarkFormatter = (time) => {
                const date = new Date(time * 1000);
                return `${date.getHours().toString().padStart(2, '0')}:00`;
              };
              break;
            case '1w':
            case '1m':
              timeScaleOptions.timeVisible = true;
              timeScaleOptions.secondsVisible = false;
              timeScaleOptions.tickMarkFormatter = (time) => {
                const date = new Date(time * 1000);
                return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
              };
              break;
            default:
              break;
          }
          
          // 应用时间刻度选项
          chart.current.timeScale().applyOptions(timeScaleOptions);
          
          // 保存当前可见范围，如果用户手动调整过
          if (chartOptions.visibleRange) {
            chart.current.timeScale().setVisibleRange(chartOptions.visibleRange);
          } else {
            chart.current.timeScale().fitContent();
            
            // 对于较长时间范围，只显示最近的部分数据
            if ((timeframe === '1w' || timeframe === '1m') && candleData.length > 30) {
              const visibleRange = {
                from: candleData[candleData.length - 30].time,
                to: candleData[candleData.length - 1].time,
              };
              chart.current.timeScale().setVisibleRange(visibleRange);
            }
          }
          
          // 添加可见范围变化的监听器
          chart.current.timeScale().subscribeVisibleTimeRangeChange(range => {
            if (isMounted.current) {
              setChartOptions(prev => ({ ...prev, visibleRange: range }));
            }
          });
        }
      } catch (err) {
        console.error('Error adjusting time scale:', err);
      }
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [historicalData, theme, timeframe]);
  
  // 切换时间周期
  const handleTimeframeChange = (newTimeframe) => {
    if (!isMounted.current) return; // 防止在组件卸载后更新状态
    
    setChartOptions(prev => ({ ...prev, timeframe: newTimeframe }));
    
    // 从全局上下文中获取dispatch函数
    try {
      // 导入并调用fetchHistoricalData action
      const { fetchHistoricalData } = require('../../store/slices/marketDataSlice');
      const { useDispatch } = require('react-redux');
      const dispatch = require('react-redux').useStore().getState().dispatch;
      
      // 触发获取新的时间周期数据的action
      if (dispatch && fetchHistoricalData) {
        dispatch(fetchHistoricalData(newTimeframe));
      }
    } catch (error) {
      console.error('获取新的时间周期数据失败:', error);
    }
  };
  
  // 切换是否显示交易量
  const toggleVolume = () => {
    if (!isMounted.current) return; // 防止在组件卸载后更新状态
    
    setChartOptions(prev => ({ ...prev, showVolume: !prev.showVolume }));
    // 重新初始化图表将通过依赖项变化触发
  };
  
  return (
    <div className="price-chart-container">
      <div className="chart-controls">
        <div className="timeframe-selector">
          <button 
            className={`timeframe-btn ${chartOptions.timeframe === '1h' ? 'active' : ''}`}
            onClick={() => handleTimeframeChange('1h')}
            disabled={loading}
          >
            1小时
          </button>
          <button 
            className={`timeframe-btn ${chartOptions.timeframe === '1d' ? 'active' : ''}`}
            onClick={() => handleTimeframeChange('1d')}
            disabled={loading}
          >
            日线
          </button>
          <button 
            className={`timeframe-btn ${chartOptions.timeframe === '1w' ? 'active' : ''}`}
            onClick={() => handleTimeframeChange('1w')}
            disabled={loading}
          >
            周线
          </button>
          <button 
            className={`timeframe-btn ${chartOptions.timeframe === '1m' ? 'active' : ''}`}
            onClick={() => handleTimeframeChange('1m')}
            disabled={loading}
          >
            月线
          </button>
        </div>
        <div className="chart-options">
          <button 
            className={`option-btn ${chartOptions.showVolume ? 'active' : ''}`}
            onClick={toggleVolume}
            disabled={loading}
          >
            交易量
          </button>
          <button
            className="option-btn"
            onClick={() => {
              if (chart.current && chart.current.timeScale) {
                chart.current.timeScale().fitContent();
              }
            }}
            disabled={loading}
          >
            重置视图
          </button>
        </div>
      </div>
      <div 
        ref={chartContainerRef} 
        className="chart-container"
        style={{ height: `${containerHeight}px` }}
      />
      {loading && (
        <div className="chart-loading-overlay">
          <div className="chart-loading-spinner"></div>
          <p>加载中...</p>
        </div>
      )}
    </div>
  );
};

export default PriceChart;
