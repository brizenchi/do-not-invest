import axios from 'axios';

// CoinGecko API基础URL
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// 获取BTC当前价格
export const getCurrentPrice = async () => {
  try {
    // 尝试使用Binance API获取实时价格，速度更快
    try {
      const binanceResponse = await axios.get('https://api.binance.com/api/v3/ticker/24hr', {
        params: { symbol: 'BTCUSDT' }
      });
      
      if (binanceResponse.data && binanceResponse.data.lastPrice) {
        const price = parseFloat(binanceResponse.data.lastPrice);
        const priceChange24h = parseFloat(binanceResponse.data.priceChangePercent);
        const volume24h = parseFloat(binanceResponse.data.quoteVolume);
        
        return {
          price: price,
          priceChange24h: priceChange24h,
          volume24h: volume24h,
          marketCap: null, // Binance不提供市值数据
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (binanceError) {
      console.warn('Binance API请求失败，将尝试CoinGecko:', binanceError);
    }
    
    // 如果Binance API失败，回退到CoinGecko
    const response = await axios.get(`${COINGECKO_API_BASE}/simple/price`, {
      params: {
        ids: 'bitcoin',
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true,
      }
    });
    
    // 防止数据缺失
    if (!response.data || !response.data.bitcoin) {
      console.warn('获取到的BTC价格数据格式不正确');
      return {
        price: 30000, // 默认值
        priceChange24h: 0,
        marketCap: 0,
        volume24h: 0,
        lastUpdated: new Date().toISOString()
      };
    }
    
    return {
      price: response.data.bitcoin.usd || 30000,
      priceChange24h: response.data.bitcoin.usd_24h_change || 0,
      marketCap: response.data.bitcoin.usd_market_cap || 0,
      volume24h: response.data.bitcoin.usd_24h_vol || 0,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('获取BTC当前价格失败:', error);
    // 返回默认值而不是抛出错误
    return {
      price: 30000, // 默认值
      priceChange24h: 0,
      marketCap: 0,
      volume24h: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};

// 获取BTC历史价格数据
export const getHistoricalData = async (days = 30, interval = 'daily') => {
  try {
    const response = await axios.get(`${COINGECKO_API_BASE}/coins/bitcoin/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: interval,
      }
    });
    
    // 处理返回的数据格式
    const { prices, market_caps, total_volumes } = response.data;
    
    // 转换为蜡烛图数据格式
    // 注意：CoinGecko API不直接提供OHLC数据，这里我们使用收盘价模拟
    // 实际应用中，您可能需要使用提供OHLC数据的API，如Binance或其他交易所API
    const candleData = prices.map((price, index) => {
      const timestamp = price[0];
      const closePrice = price[1];
      
      // 简单模拟开盘价、最高价和最低价
      // 在实际应用中，您应该使用真实的OHLC数据
      const openPrice = index > 0 ? prices[index - 1][1] : closePrice;
      const highPrice = Math.max(openPrice, closePrice) * 1.005; // 模拟最高价
      const lowPrice = Math.min(openPrice, closePrice) * 0.995; // 模拟最低价
      
      return {
        time: timestamp / 1000, // 转换为秒级时间戳
        open: openPrice,
        high: highPrice,
        low: lowPrice,
        close: closePrice,
        volume: total_volumes[index] ? total_volumes[index][1] : 0,
      };
    });
    
    return candleData;
  } catch (error) {
    console.error('获取BTC历史价格数据失败:', error);
    throw error;
  }
};

// 获取OHLC数据（用于蜡烛图）
export const getOHLCData = async (timeframe = '1d') => {
  // 根据不同的时间周期调整参数
  const daysMap = {
    '1h': 1,
    '1d': 30,
    '1w': 90,
    '1m': 180,
    'all': 'max'
  };
  
  const days = daysMap[timeframe] || 30;
  
  try {
    console.log(`获取${timeframe}时间周期的OHLC数据，天数: ${days}`);
    
    // 尝试使用Binance API获取更准确的OHLC数据
    try {
      // 根据时间周期选择不同的时间间隔
      const intervalMap = {
        '1h': '1h',
        '1d': '1d',
        '1w': '1w',
        '1m': '1M',
        'all': '1M'
      };
      const interval = intervalMap[timeframe] || '1d';
      
      // 计算限制，确保数据量合适
      const limitMap = {
        '1h': 24,     // 24小时
        '1d': 30,     // 30天
        '1w': 52,     // 52周
        '1m': 12,     // 12个月
        'all': 60     // 最多60个数据点
      };
      const limit = limitMap[timeframe] || 30;
      
      // 请求Binance API
      const binanceResponse = await axios.get('https://api.binance.com/api/v3/klines', {
        params: {
          symbol: 'BTCUSDT',
          interval: interval,
          limit: limit
        }
      });
      
      if (binanceResponse.data && Array.isArray(binanceResponse.data) && binanceResponse.data.length > 0) {
        // 处理Binance的K线数据
        const formattedData = binanceResponse.data.map(candle => ({
          time: Math.floor(candle[0] / 1000), // 转换为秒级时间戳
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5])
        }));
        
        // 确保数据按时间戳排序
        formattedData.sort((a, b) => a.time - b.time);
        
        console.log(`成功从 Binance 获取${timeframe}时间周期的数据，数据点数: ${formattedData.length}`);
        return formattedData;
      }
    } catch (binanceError) {
      console.warn('Binance API请求失败，将尝试CoinGecko:', binanceError);
    }
    
    // 如果Binance API失败，回退到CoinGecko
    // 对于1小时周期，使用不同的端点和参数
    let endpoint = '/coins/bitcoin/ohlc';
    let params = {
      vs_currency: 'usd',
      days: days
    };
    
    // 特殊处理小时级数据
    if (timeframe === '1h') {
      // 小时级数据需要更精细的间隔
      endpoint = '/coins/bitcoin/market_chart';
      params = {
        vs_currency: 'usd',
        days: 1,
        interval: 'hourly'
      };
    }
    
    // 请求CoinGecko API
    const response = await axios.get(`${COINGECKO_API_BASE}${endpoint}`, { params });
    
    // 验证响应数据
    if (!response.data) {
      console.warn('获取到的OHLC数据格式不正确');
      return generateMockOHLCData(days, timeframe);
    }
    
    // 处理不同端点返回的不同数据格式
    let formattedData;
    
    if (timeframe === '1h' && response.data.prices) {
      // 处理market_chart端点的数据（小时级）
      formattedData = formatMarketChartData(response.data, timeframe);
    } else if (Array.isArray(response.data)) {
      // 处理OHLC端点的数据（日/周/月级）
      formattedData = response.data.map(candle => ({
        time: Math.floor(candle[0] / 1000), // 转换为秒级时间戳
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: Math.random() * 1000000 + 500000, // 模拟交易量，因为CoinGecko的OHLC端点不提供交易量
      }));
    } else {
      console.warn('意外的数据格式，使用模拟数据');
      return generateMockOHLCData(days, timeframe);
    }
    
    // 确保数据有效且数量充足
    if (!formattedData || formattedData.length < 5) {
      console.warn(`获取到的${timeframe}数据点数不足(${formattedData?.length || 0})，使用模拟数据`);
      return generateMockOHLCData(days, timeframe);
    }
    
    // 确保数据按时间戳排序
    formattedData.sort((a, b) => a.time - b.time);
    
    console.log(`成功从 CoinGecko 获取${timeframe}时间周期的数据，数据点数: ${formattedData.length}`);
    return formattedData;
  } catch (error) {
    console.error(`获取${timeframe}时间周期的BTC数据失败:`, error);
    // 返回模拟数据而不是抛出错误
    return generateMockOHLCData(days, timeframe);
  }
};

// 将market_chart端点的数据转换为蜡烛图格式
function formatMarketChartData(marketData, timeframe) {
  if (!marketData.prices || !Array.isArray(marketData.prices)) {
    return [];
  }
  
  const { prices, total_volumes } = marketData;
  
  // 根据时间周期确定数据点间隔
  const interval = timeframe === '1h' ? 3600 * 1000 : 24 * 3600 * 1000; // 小时或日间隔（毫秒）
  
  // 将价格数据转换为蜡烛图格式
  return prices.map((price, index) => {
    const timestamp = price[0];
    const closePrice = price[1];
    
    // 获取上一个时间点的价格作为开盘价
    const openPrice = index > 0 ? prices[index - 1][1] : closePrice;
    
    // 如果有足够的数据点，找出当前时间区间内的最高和最低价
    let highPrice = closePrice;
    let lowPrice = closePrice;
    
    // 在当前时间区间内寻找最高和最低价
    const startTime = timestamp - interval;
    const endTime = timestamp;
    
    // 找出该时间区间内的所有价格点
    const pricesInInterval = prices.filter(p => p[0] >= startTime && p[0] <= endTime);
    
    if (pricesInInterval.length > 0) {
      // 找出区间内的最高和最低价
      highPrice = Math.max(...pricesInInterval.map(p => p[1]));
      lowPrice = Math.min(...pricesInInterval.map(p => p[1]));
    } else {
      // 如果没有足够的数据点，使用模拟值
      highPrice = Math.max(openPrice, closePrice) * 1.005;
      lowPrice = Math.min(openPrice, closePrice) * 0.995;
    }
    
    // 获取交易量数据，如果有的话
    const volume = total_volumes && total_volumes[index] ? total_volumes[index][1] : Math.random() * 1000000 + 500000;
    
    return {
      time: Math.floor(timestamp / 1000), // 转换为秒级时间戳
      open: openPrice,
      high: highPrice,
      low: lowPrice,
      close: closePrice,
      volume: volume
    };
  });
}

// 生成模拟的OHLC数据
// 当API请求失败时使用此函数生成模拟数据
function generateMockOHLCData(days, timeframe = '1d') {
  const data = [];
  const now = Date.now(); // 当前时间戳（毫秒）
  const basePrice = 30000; // 基准价格
  
  // 根据时间周期确定时间间隔和数据点数
  let interval, points;
  
  switch (timeframe) {
    case '1h':
      // 1小时周期：每5分钟一个数据点，总计24小时
      interval = 5 * 60 * 1000; // 5分钟
      points = 24 * 12; // 24小时 x 每小时12个点（每5分钟一个）
      break;
    case '1d':
      // 日线：每小时一个数据点，总计30天
      interval = 60 * 60 * 1000; // 1小时
      points = Math.min(days * 24, 30 * 24); // 最多30天数据
      break;
    case '1w':
      // 周线：每天一个数据点，总计90天
      interval = 24 * 60 * 60 * 1000; // 1天
      points = Math.min(days, 90); // 最多90天数据
      break;
    case '1m':
      // 月线：每天一个数据点，总计180天
      interval = 24 * 60 * 60 * 1000; // 1天
      points = Math.min(days, 180); // 最多180天数据
      break;
    default:
      // 默认情况，每天一个数据点，30天
      interval = 24 * 60 * 60 * 1000; // 1天
      points = 30; // 30天
  }
  
  // 生成一个真实的价格趋势
  // 使用正弦波加随机噪声模拟价格波动
  const trendDirection = Math.random() > 0.5 ? 1 : -1; // 随机上升或下降趋势
  const trendStrength = Math.random() * 0.2 + 0.05; // 趋势强度（5-25%）
  const volatility = Math.random() * 0.03 + 0.02; // 波动率（2-5%）
  
  // 确保至少生成 30 个数据点，使图表有足够的数据显示
  points = Math.max(points, 30);
  
  // 生成数据点
  for (let i = 0; i < points; i++) {
    const timestamp = now - (points - i - 1) * interval;
    
    // 计算趋势因素
    const trendFactor = trendDirection * trendStrength * (i / points);
    
    // 添加周期性波动（模拟市场周期）
    const cycleFactor = Math.sin(i / (points / 6)) * volatility * basePrice;
    
    // 添加随机噪声
    const noiseFactor = (Math.random() * 2 - 1) * volatility * basePrice;
    
    // 计算收盘价，确保价格始终为正数
    const close = Math.max(basePrice * (1 + trendFactor) + cycleFactor + noiseFactor, 100);
    
    // 根据时间周期生成不同的波动幅度
    let openVariation, highVariation, lowVariation;
    
    switch (timeframe) {
      case '1h':
        // 小时级波动较小
        openVariation = 0.002;
        highVariation = 0.003;
        lowVariation = 0.003;
        break;
      case '1d':
        // 日线波动中等
        openVariation = 0.005;
        highVariation = 0.008;
        lowVariation = 0.008;
        break;
      case '1w':
      case '1m':
        // 周/月线波动较大
        openVariation = 0.01;
        highVariation = 0.015;
        lowVariation = 0.015;
        break;
      default:
        openVariation = 0.005;
        highVariation = 0.008;
        lowVariation = 0.008;
    }
    
    // 生成开盘价、最高价和最低价
    const open = i > 0 ? data[i-1].close : close * (1 + (Math.random() * 2 - 1) * openVariation);
    const high = Math.max(open, close) * (1 + Math.random() * highVariation);
    const low = Math.min(open, close) * (1 - Math.random() * lowVariation);
    
    // 生成交易量（与价格变化相关）
    const priceChange = Math.abs(close - open) / open;
    const volumeBase = 500000 + Math.random() * 1500000; // 基础交易量
    const volume = volumeBase * (1 + priceChange * 10); // 价格变化越大，交易量越大
    
    // 使用更精确的价格格式，确保数据类型一致
    data.push({
      time: Math.floor(timestamp / 1000), // 转换为秒级时间戳
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.round(volume)
    });
  }
  
  // 确保数据按时间戳排序
  data.sort((a, b) => a.time - b.time);
  
  // 确保数据点数量充足
  if (data.length < 10) {
    console.warn(`生成的模拟数据点数不足(${data.length})，添加更多数据点`);
    return generateMockOHLCData(days * 2, timeframe); // 递归调用，生成更多数据点
  }
  
  console.log(`生成了${timeframe}时间周期的模拟数据，数据点数: ${data.length}`);
  return data;
}

// 实时价格更新服务
export const subscribeToRealtimeUpdates = (callback) => {
  if (!callback || typeof callback !== 'function') {
    console.error('订阅实时更新时需要提供有效的回调函数');
    return () => {}; // 返回空函数
  }
  
  let lastPrice = null;
  let websocket = null;
  let fallbackInterval = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  
  // 尝试连接WebSocket
  const connectWebSocket = () => {
    try {
      // 尝试使用Binance的WebSocket API获取实时BTC价格
      // 注意：这是公开的API，不需要认证
      websocket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
      
      websocket.onopen = () => {
        console.log('成功连接到Binance WebSocket API');
        reconnectAttempts = 0;
        
        // 成功连接后清除备用定时器
        if (fallbackInterval) {
          clearInterval(fallbackInterval);
          fallbackInterval = null;
        }
      };
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // 从数据中提取相关信息
          const price = parseFloat(data.c); // 当前价格
          const priceChange24h = parseFloat(data.P); // 24小时价格变化百分比
          const volume24h = parseFloat(data.v) * price; // 24小时交易量价值
          
          // 如果价格有变化，才触发回调
          if (lastPrice === null || price !== lastPrice) {
            lastPrice = price;
            
            // 调用回调函数传递数据
            callback({
              price: price,
              priceChange24h: priceChange24h,
              volume24h: volume24h,
              marketCap: null, // Binance API不提供市值数据
              lastUpdated: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('WebSocket数据解析错误:', error);
        }
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        fallbackToPolling();
      };
      
      websocket.onclose = () => {
        console.log('WebSocket连接关闭');
        
        // 尝试重连
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`尝试重新连接 (${reconnectAttempts}/${maxReconnectAttempts})...`);
          setTimeout(connectWebSocket, 3000); // 3秒后重试
        } else {
          console.log('达到最大重连次数，切换到轮询模式');
          fallbackToPolling();
        }
      };
    } catch (error) {
      console.error('WebSocket初始化错误:', error);
      fallbackToPolling();
    }
  };
  
  // 如果WebSocket失败，切换到轮询模式
  const fallbackToPolling = async () => {
    if (fallbackInterval) return; // 已经在轮询模式
    
    console.log('切换到轮询模式获取BTC价格');
    
    // 立即获取一次数据
    try {
      const currentPrice = await getCurrentPrice();
      callback(currentPrice);
    } catch (error) {
      console.error('初始化价格获取失败:', error);
      callback({
        price: 30000,
        priceChange24h: 0,
        marketCap: 0,
        volume24h: 0,
        lastUpdated: new Date().toISOString()
      });
    }
    
    // 设置定时器定期获取数据
    fallbackInterval = setInterval(async () => {
      try {
        const currentPrice = await getCurrentPrice();
        callback(currentPrice);
      } catch (error) {
        console.error('实时价格更新失败:', error);
      }
    }, 10000); // 每10秒更新一次
  };
  
  // 首先尝试WebSocket连接
  connectWebSocket();
  
  // 返回取消订阅函数
  return () => {
    try {
      // 关闭WebSocket连接
      if (websocket) {
        websocket.close();
        websocket = null;
      }
      
      // 清除定时器
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
      }
    } catch (error) {
      console.error('清理资源失败:', error);
    }
  };
};
