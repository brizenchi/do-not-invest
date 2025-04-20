import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

const PositionHistory = () => {
  const { positions } = useSelector(state => state.position);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterType, setFilterType] = useState('all');

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPositions = [...positions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredPositions = sortedPositions.filter(position => {
    if (filterType === 'all') return true;
    if (filterType === 'manual') return position.type === 'manual';
    if (filterType === 'auto') return position.type === 'auto';
    return true;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const exportToCSV = () => {
    if (positions.length === 0) return;

    const headers = ['日期', '类型', '投资金额 (USD)', 'BTC数量', 'BTC价格', '来源'];
    const csvContent = [
      headers.join(','),
      ...filteredPositions.map(position => [
        format(new Date(position.date), 'yyyy-MM-dd HH:mm:ss'),
        position.type === 'manual' ? '手动' : '自动',
        position.investedAmount,
        position.btcAmount,
        position.btcPrice,
        position.source
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `btc-positions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="position-history">
      <h1>定投历史记录</h1>
      
      <div className="filters-container mb-4 flex justify-between items-center">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`} 
            onClick={() => setFilterType('all')}
          >
            全部
          </button>
          <button 
            className={`filter-btn ${filterType === 'auto' ? 'active' : ''}`} 
            onClick={() => setFilterType('auto')}
          >
            自动定投
          </button>
          <button 
            className={`filter-btn ${filterType === 'manual' ? 'active' : ''}`} 
            onClick={() => setFilterType('manual')}
          >
            手动投入
          </button>
        </div>
        
        <button 
          className="btn-secondary"
          onClick={exportToCSV}
          disabled={positions.length === 0}
        >
          导出CSV
        </button>
      </div>
      
      <div className="card">
        <div className="table-container">
          <table className="position-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('date')}>
                  日期 {getSortIcon('date')}
                </th>
                <th onClick={() => handleSort('type')}>
                  类型 {getSortIcon('type')}
                </th>
                <th onClick={() => handleSort('investedAmount')}>
                  投资金额 (USD) {getSortIcon('investedAmount')}
                </th>
                <th onClick={() => handleSort('btcAmount')}>
                  BTC数量 {getSortIcon('btcAmount')}
                </th>
                <th onClick={() => handleSort('btcPrice')}>
                  BTC价格 {getSortIcon('btcPrice')}
                </th>
                <th>来源</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">暂无定投记录</td>
                </tr>
              ) : (
                filteredPositions.map((position) => (
                  <tr key={position.id}>
                    <td>{format(new Date(position.date), 'yyyy-MM-dd HH:mm')}</td>
                    <td>{position.type === 'manual' ? '手动' : '自动'}</td>
                    <td>${position.investedAmount.toLocaleString()}</td>
                    <td>{position.btcAmount.toFixed(8)}</td>
                    <td>${position.btcPrice.toLocaleString()}</td>
                    <td>{position.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="position-summary mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <h3>总投入</h3>
          <p className="summary-value">
            ${positions.reduce((sum, pos) => sum + pos.investedAmount, 0).toLocaleString()}
          </p>
        </div>
        
        <div className="card p-4">
          <h3>总BTC数量</h3>
          <p className="summary-value">
            {positions.reduce((sum, pos) => sum + pos.btcAmount, 0).toFixed(8)} BTC
          </p>
        </div>
        
        <div className="card p-4">
          <h3>平均购买价格</h3>
          <p className="summary-value">
            {positions.length > 0
              ? `$${(
                  positions.reduce((sum, pos) => sum + pos.investedAmount, 0) /
                  positions.reduce((sum, pos) => sum + pos.btcAmount, 0)
                ).toLocaleString()}`
              : '$0'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PositionHistory;
