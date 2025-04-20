import { format, subDays, subHours, subMonths } from 'date-fns';

// 策略列表
export const strategies = [
  {
    id: 1,
    name: "定投BTC策略",
    description: "每周定投100USDT购买BTC",
    status: "active",
    createdAt: "2024-01-01",
    totalInvestment: 1200,
    currentValue: 1380,
    profit: 180,
    profitRate: 15,
    executionCount: 12,
    nextExecutionTime: "2024-02-20 10:00:00",
    settings: {
      amount: 100,
      interval: "weekly",
      executionDay: "monday",
      executionTime: "10:00",
      maxPriceLimit: 50000,
      minPriceLimit: 35000
    }
  },
  {
    id: 2,
    name: "ETH动态调仓策略",
    description: "根据ETH价格波动动态调整仓位",
    status: "paused",
    createdAt: "2024-01-15",
    totalInvestment: 800,
    currentValue: 920,
    profit: 120,
    profitRate: 15,
    executionCount: 8,
    nextExecutionTime: "2024-02-21 10:00:00",
    settings: {
      baseAmount: 100,
      maxPositionSize: 2000,
      minPositionSize: 200,
      rebalanceThreshold: 0.1,
      volatilityMultiplier: 1.5
    }
  },
  {
    id: 3,
    name: "BNB网格策略",
    description: "在BNB价格区间内进行网格交易",
    status: "active",
    createdAt: "2024-02-01",
    totalInvestment: 500,
    currentValue: 485,
    profit: -15,
    profitRate: -3,
    executionCount: 24,
    nextExecutionTime: "2024-02-19 12:00:00",
    settings: {
      upperPrice: 350,
      lowerPrice: 250,
      gridCount: 10,
      amountPerGrid: 50
    }
  }
];

// 当前持仓
export const positions = [
  {
    id: 1,
    symbol: "BTC",
    amount: 0.028,
    averagePrice: 42857.14,
    currentPrice: 49000,
    value: 1372,
    cost: 1200,
    profit: 172,
    profitRate: 14.33,
    strategyId: 1,
    lastUpdated: "2024-02-19 08:30:00"
  },
  {
    id: 2,
    symbol: "ETH",
    amount: 0.4,
    averagePrice: 2000,
    currentPrice: 2300,
    value: 920,
    cost: 800,
    profit: 120,
    profitRate: 15,
    strategyId: 2,
    lastUpdated: "2024-02-19 08:30:00"
  },
  {
    id: 3,
    symbol: "BNB",
    amount: 1.65,
    averagePrice: 303.03,
    currentPrice: 293.94,
    value: 485,
    cost: 500,
    profit: -15,
    profitRate: -3,
    strategyId: 3,
    lastUpdated: "2024-02-19 08:30:00"
  }
];

// 生成历史价格数据
const generatePriceHistory = (basePrice, days, volatility = 0.02) => {
  const data = [];
  let currentPrice = basePrice;
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    // 生成更真实的价格走势
    const trend = Math.sin(i / 10) * 0.003; // 添加周期性趋势
    const randomChange = (Math.random() - 0.5) * volatility + trend;
    currentPrice = currentPrice * (1 + randomChange);
    
    // 添加日内价格
    for (let hour = 0; hour < 24; hour += 4) {
      const hourlyChange = (Math.random() - 0.5) * (volatility / 4);
      const hourlyPrice = currentPrice * (1 + hourlyChange);
      data.push({
        time: format(subHours(date, hour), 'yyyy-MM-dd HH:mm:ss'),
        value: hourlyPrice.toFixed(2),
        volume: Math.floor(Math.random() * 1000 + 500)
      });
    }
  }
  return data.sort((a, b) => new Date(a.time) - new Date(b.time));
};

// 价格历史数据
export const priceHistory = {
  BTC: generatePriceHistory(45000, 30, 0.025),
  ETH: generatePriceHistory(2200, 30, 0.03),
  BNB: generatePriceHistory(300, 30, 0.02)
};

// 生成更详细的交易历史
const generateDetailedTradeHistory = () => {
  const history = [];
  let btcPrice = 42000;
  let ethPrice = 2000;
  let bnbPrice = 300;

  // BTC策略交易历史
  for (let i = 0; i < 12; i++) {
    const date = subDays(new Date(), i * 7);
    const priceChange = (Math.random() - 0.5) * 0.05;
    btcPrice = btcPrice * (1 + priceChange);
    
    history.push({
      id: history.length + 1,
      strategyId: 1,
      symbol: "BTC",
      type: "buy",
      amount: (100 / btcPrice).toFixed(6),
      price: btcPrice.toFixed(2),
      total: 100,
      timestamp: format(date, 'yyyy-MM-dd HH:mm:ss'),
      status: "completed",
      fee: (0.1).toFixed(2),
      orderId: `BTC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exchangeId: "binance"
    });
  }

  // ETH策略交易历史
  for (let i = 0; i < 8; i++) {
    const date = subDays(new Date(), i * 7);
    const priceChange = (Math.random() - 0.5) * 0.05;
    ethPrice = ethPrice * (1 + priceChange);
    
    history.push({
      id: history.length + 1,
      strategyId: 2,
      symbol: "ETH",
      type: "buy",
      amount: (100 / ethPrice).toFixed(6),
      price: ethPrice.toFixed(2),
      total: 100,
      timestamp: format(date, 'yyyy-MM-dd HH:mm:ss'),
      status: "completed",
      fee: (0.1).toFixed(2),
      orderId: `ETH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exchangeId: "binance"
    });
  }

  // BNB网格交易历史
  for (let i = 0; i < 24; i++) {
    const date = subDays(new Date(), Math.floor(i / 2));
    const isEven = i % 2 === 0;
    const priceChange = (Math.random() - 0.5) * 0.02;
    bnbPrice = bnbPrice * (1 + priceChange);
    
    history.push({
      id: history.length + 1,
      strategyId: 3,
      symbol: "BNB",
      type: isEven ? "buy" : "sell",
      amount: (50 / bnbPrice).toFixed(6),
      price: bnbPrice.toFixed(2),
      total: 50,
      timestamp: format(date, 'yyyy-MM-dd HH:mm:ss'),
      status: "completed",
      fee: (0.05).toFixed(2),
      orderId: `BNB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exchangeId: "binance"
    });
  }

  return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const tradeHistory = generateDetailedTradeHistory();

// 生成详细的收益历史
const generateDetailedProfitHistory = () => {
  const daily = [];
  const weekly = [];
  const monthly = [];

  // 生成每日收益
  for (let i = 0; i < 30; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const baseProfit = (Math.random() - 0.45) * 100; // 有正有负的收益
    
    daily.push({
      date,
      profit: baseProfit.toFixed(2),
      profitRate: (baseProfit / 2000 * 100).toFixed(2), // 基于总投资2000计算收益率
      btcProfit: (baseProfit * 0.6).toFixed(2), // BTC占60%
      ethProfit: (baseProfit * 0.3).toFixed(2), // ETH占30%
      bnbProfit: (baseProfit * 0.1).toFixed(2), // BNB占10%
    });
  }

  // 生成每周收益
  for (let i = 0; i < 12; i++) {
    const weekNumber = format(subDays(new Date(), i * 7), 'yyyy-ww');
    const baseProfit = (Math.random() * 200 - 50); // 周收益波动更大
    
    weekly.push({
      date: weekNumber,
      profit: baseProfit.toFixed(2),
      profitRate: (baseProfit / 2000 * 100).toFixed(2),
      btcProfit: (baseProfit * 0.6).toFixed(2),
      ethProfit: (baseProfit * 0.3).toFixed(2),
      bnbProfit: (baseProfit * 0.1).toFixed(2),
    });
  }

  // 生成每月收益
  for (let i = 0; i < 6; i++) {
    const date = format(subMonths(new Date(), i), 'yyyy-MM');
    const baseProfit = (Math.random() * 500 - 100); // 月收益波动最大
    
    monthly.push({
      date,
      profit: baseProfit.toFixed(2),
      profitRate: (baseProfit / 2000 * 100).toFixed(2),
      btcProfit: (baseProfit * 0.6).toFixed(2),
      ethProfit: (baseProfit * 0.3).toFixed(2),
      bnbProfit: (baseProfit * 0.1).toFixed(2),
    });
  }

  return {
    daily: daily.sort((a, b) => b.date.localeCompare(a.date)),
    weekly: weekly.sort((a, b) => b.date.localeCompare(a.date)),
    monthly: monthly.sort((a, b) => b.date.localeCompare(a.date))
  };
};

export const profitHistory = generateDetailedProfitHistory();

// 扩展策略执行记录
export const strategyExecutionLogs = [
  {
    id: 1,
    strategyId: 1,
    executionTime: "2024-02-19 10:00:00",
    status: "success",
    details: "成功执行BTC定投策略，购买0.002 BTC",
    tradeId: 20,
    marketPrice: 49000,
    executionPrice: 48980,
    slippage: "0.04%",
    gasFee: 0.1
  },
  {
    id: 2,
    strategyId: 2,
    executionTime: "2024-02-19 10:00:00",
    status: "success",
    details: "成功执行ETH动态调仓策略，购买0.05 ETH",
    tradeId: 21,
    marketPrice: 2300,
    executionPrice: 2298,
    slippage: "0.09%",
    gasFee: 0.1
  },
  {
    id: 3,
    strategyId: 3,
    executionTime: "2024-02-19 09:30:00",
    status: "success",
    details: "执行BNB网格交易，卖出0.2 BNB",
    tradeId: 22,
    marketPrice: 295,
    executionPrice: 294.8,
    slippage: "0.07%",
    gasFee: 0.05
  },
  {
    id: 4,
    strategyId: 3,
    executionTime: "2024-02-19 08:15:00",
    status: "success",
    details: "执行BNB网格交易，买入0.2 BNB",
    tradeId: 23,
    marketPrice: 292,
    executionPrice: 292.2,
    slippage: "0.07%",
    gasFee: 0.05
  },
  {
    id: 5,
    strategyId: 1,
    executionTime: "2024-02-12 10:00:00",
    status: "success",
    details: "成功执行BTC定投策略，购买0.0021 BTC",
    tradeId: 18,
    marketPrice: 47500,
    executionPrice: 47485,
    slippage: "0.03%",
    gasFee: 0.1
  }
];

// 资产总览
export const portfolioSummary = {
  totalValue: 2777, // 总市值
  totalCost: 2500, // 总成本
  totalProfit: 277, // 总收益
  totalProfitRate: 11.08, // 总收益率
  dailyProfit: 35.2, // 日收益
  dailyProfitRate: 1.2, // 日收益率
  weeklyProfit: 120.5, // 周收益
  weeklyProfitRate: 4.2, // 周收益率
  monthlyProfit: 292.0, // 月收益
  monthlyProfitRate: 8.5, // 月收益率
  assetAllocation: {
    BTC: {
      value: 1372,
      percentage: 49.4
    },
    ETH: {
      value: 920,
      percentage: 33.1
    },
    BNB: {
      value: 485,
      percentage: 17.5
    }
  },
  riskMetrics: {
    volatility: 0.15, // 波动率
    sharpeRatio: 2.1, // 夏普比率
    maxDrawdown: 0.12, // 最大回撤
    winRate: 0.65 // 胜率
  },
  performanceMetrics: {
    dailyAvgProfit: 12.5,
    weeklyAvgProfit: 85.3,
    monthlyAvgProfit: 236.2,
    bestDay: 85.6,
    worstDay: -45.2
  }
}; 