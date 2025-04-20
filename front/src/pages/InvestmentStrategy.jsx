import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveStrategy, setActiveStrategy } from '../store/slices/strategySlice';

const InvestmentStrategy = () => {
  const dispatch = useDispatch();
  const { savedStrategies, activeStrategy } = useSelector(state => state.strategy);
  const { currentPrice } = useSelector(state => state.marketData);
  
  const [strategyForm, setStrategyForm] = useState({
    name: '',
    frequency: 'weekly',
    amount: '',
    dayOfWeek: '1', // 周一
    dayOfMonth: '1',
    enablePriceCondition: false,
    priceConditionType: 'below',
    priceThreshold: '',
    enableDynamicAmount: false,
    dynamicAmountType: 'increase',
    dynamicAmountPercentage: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStrategyForm({
      ...strategyForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newStrategy = {
      id: Date.now().toString(),
      ...strategyForm,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    dispatch(saveStrategy(newStrategy));
    dispatch(setActiveStrategy(newStrategy));
    
    // 重置表单
    setStrategyForm({
      name: '',
      frequency: 'weekly',
      amount: '',
      dayOfWeek: '1',
      dayOfMonth: '1',
      enablePriceCondition: false,
      priceConditionType: 'below',
      priceThreshold: '',
      enableDynamicAmount: false,
      dynamicAmountType: 'increase',
      dynamicAmountPercentage: '',
    });
  };

  const activateStrategy = (strategy) => {
    dispatch(setActiveStrategy(strategy));
  };

  return (
    <div className="investment-strategy">
      <h1>定投策略设置</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="mb-3">创建新策略</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="name">策略名称</label>
              <input
                type="text"
                id="name"
                name="name"
                value={strategyForm.name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="例如：每周定投"
                required
              />
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="frequency">定投频率</label>
              <select
                id="frequency"
                name="frequency"
                value={strategyForm.frequency}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
            
            {strategyForm.frequency === 'weekly' && (
              <div className="form-group mb-3">
                <label htmlFor="dayOfWeek">每周几执行</label>
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  value={strategyForm.dayOfWeek}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="1">周一</option>
                  <option value="2">周二</option>
                  <option value="3">周三</option>
                  <option value="4">周四</option>
                  <option value="5">周五</option>
                  <option value="6">周六</option>
                  <option value="0">周日</option>
                </select>
              </div>
            )}
            
            {strategyForm.frequency === 'monthly' && (
              <div className="form-group mb-3">
                <label htmlFor="dayOfMonth">每月几号执行</label>
                <select
                  id="dayOfMonth"
                  name="dayOfMonth"
                  value={strategyForm.dayOfMonth}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  {[...Array(28)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}日
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="form-group mb-3">
              <label htmlFor="amount">定投金额 (USD)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={strategyForm.amount}
                onChange={handleInputChange}
                className="form-control"
                placeholder="例如：100"
                min="1"
                required
              />
            </div>
            
            <div className="form-check mb-3">
              <input
                type="checkbox"
                id="enablePriceCondition"
                name="enablePriceCondition"
                checked={strategyForm.enablePriceCondition}
                onChange={handleInputChange}
                className="form-check-input"
              />
              <label htmlFor="enablePriceCondition" className="form-check-label">
                启用价格条件
              </label>
            </div>
            
            {strategyForm.enablePriceCondition && (
              <div className="price-condition mb-3">
                <div className="form-group">
                  <label htmlFor="priceConditionType">价格条件类型</label>
                  <select
                    id="priceConditionType"
                    name="priceConditionType"
                    value={strategyForm.priceConditionType}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="below">价格低于</option>
                    <option value="above">价格高于</option>
                  </select>
                </div>
                
                <div className="form-group mt-2">
                  <label htmlFor="priceThreshold">价格阈值 (USD)</label>
                  <input
                    type="number"
                    id="priceThreshold"
                    name="priceThreshold"
                    value={strategyForm.priceThreshold}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder={`当前价格: ${currentPrice ? '$' + currentPrice.toLocaleString() : '加载中...'}`}
                    min="0"
                    required={strategyForm.enablePriceCondition}
                  />
                </div>
              </div>
            )}
            
            <div className="form-check mb-3">
              <input
                type="checkbox"
                id="enableDynamicAmount"
                name="enableDynamicAmount"
                checked={strategyForm.enableDynamicAmount}
                onChange={handleInputChange}
                className="form-check-input"
              />
              <label htmlFor="enableDynamicAmount" className="form-check-label">
                启用动态金额
              </label>
            </div>
            
            {strategyForm.enableDynamicAmount && (
              <div className="dynamic-amount mb-3">
                <div className="form-group">
                  <label htmlFor="dynamicAmountType">动态金额类型</label>
                  <select
                    id="dynamicAmountType"
                    name="dynamicAmountType"
                    value={strategyForm.dynamicAmountType}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="increase">价格下跌时增加投入</option>
                    <option value="decrease">价格上涨时减少投入</option>
                  </select>
                </div>
                
                <div className="form-group mt-2">
                  <label htmlFor="dynamicAmountPercentage">调整百分比</label>
                  <input
                    type="number"
                    id="dynamicAmountPercentage"
                    name="dynamicAmountPercentage"
                    value={strategyForm.dynamicAmountPercentage}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="例如：10"
                    min="1"
                    max="100"
                    required={strategyForm.enableDynamicAmount}
                  />
                </div>
              </div>
            )}
            
            <button type="submit" className="btn-primary mt-3">
              保存策略
            </button>
          </form>
        </div>
        
        <div className="card p-4">
          <h2 className="mb-3">已保存的策略</h2>
          
          {savedStrategies.length === 0 ? (
            <p>暂无保存的策略</p>
          ) : (
            <div className="strategies-list">
              {savedStrategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className={`strategy-item p-3 mb-2 ${
                    activeStrategy && activeStrategy.id === strategy.id ? 'active' : ''
                  }`}
                >
                  <h3>{strategy.name}</h3>
                  <p>
                    频率: {
                      strategy.frequency === 'daily' ? '每日' :
                      strategy.frequency === 'weekly' ? '每周' : '每月'
                    }
                  </p>
                  <p>金额: ${strategy.amount}</p>
                  
                  {!activeStrategy || activeStrategy.id !== strategy.id ? (
                    <button
                      className="btn-secondary mt-2"
                      onClick={() => activateStrategy(strategy)}
                    >
                      激活此策略
                    </button>
                  ) : (
                    <span className="active-badge">当前活跃</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentStrategy;
