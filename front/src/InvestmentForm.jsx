import React, { useState } from 'react';
import axios from 'axios';

const InvestmentForm = () => {
  const [strategy, setStrategy] = useState('');
  const [result, setResult] = useState('');
  const userAddress = '0xUserAddress'; // 假设从钱包获取

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8000/invest', {
        strategy,
        user_address: userAddress
      });
      setResult(response.data.message);
    } catch (error) {
      setResult(`Error: ${error.response.data.detail}`);
    }
  };

  return (
    <div>
      <h1>MoveFlow 自动化投资</h1>
      <textarea
        value={strategy}
        onChange={(e) => setStrategy(e.target.value)}
        placeholder="输入投资策略，例如：每周投资 100 USDT 到 Amnis Finance"
      />
      <button onClick={handleSubmit}>执行投资</button>
      <p>{result}</p>
    </div>
  );
};

export default InvestmentForm;