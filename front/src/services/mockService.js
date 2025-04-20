import {
  strategies,
  positions,
  priceHistory,
  tradeHistory,
  profitHistory,
  strategyExecutionLogs,
  portfolioSummary
} from '../mock/data';

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  // 获取策略列表
  async getStrategies() {
    await delay(300);
    return strategies;
  },

  // 获取单个策略详情
  async getStrategy(id) {
    await delay(200);
    return strategies.find(s => s.id === id);
  },

  // 获取持仓列表
  async getPositions() {
    await delay(300);
    return positions;
  },

  // 获取价格历史
  async getPriceHistory(symbol) {
    await delay(400);
    return priceHistory[symbol] || [];
  },

  // 获取交易历史
  async getTradeHistory(params = {}) {
    await delay(300);
    let filteredHistory = [...tradeHistory];
    
    if (params.strategyId) {
      filteredHistory = filteredHistory.filter(t => t.strategyId === params.strategyId);
    }
    if (params.symbol) {
      filteredHistory = filteredHistory.filter(t => t.symbol === params.symbol);
    }
    
    return filteredHistory;
  },

  // 获取收益历史
  async getProfitHistory(timeframe = 'daily') {
    await delay(200);
    return profitHistory[timeframe] || [];
  },

  // 获取策略执行记录
  async getStrategyExecutionLogs(strategyId) {
    await delay(200);
    if (strategyId) {
      return strategyExecutionLogs.filter(log => log.strategyId === strategyId);
    }
    return strategyExecutionLogs;
  },

  // 获取资产总览
  async getPortfolioSummary() {
    await delay(200);
    return portfolioSummary;
  },

  // 暂停策略
  async pauseStrategy(id) {
    await delay(200);
    return { success: true, message: '策略已暂停' };
  },

  // 恢复策略
  async resumeStrategy(id) {
    await delay(200);
    return { success: true, message: '策略已恢复' };
  },

  // 删除策略
  async deleteStrategy(id) {
    await delay(200);
    return { success: true, message: '策略已删除' };
  }
}; 