import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, List, Avatar, message, Spin } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { saveStrategy } from '../store/slices/strategySlice';
import { connectWallet } from '../store/slices/walletSlice';

const AIStrategyChat = ({ onStrategyCreate }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const { address, connected } = useSelector(state => state.wallet);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 添加消息
  const addMessage = (content, isAI = false) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      content,
      isAI,
      timestamp: new Date().toISOString()
    }]);
  };

  // 处理用户输入
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 处理发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // 检查钱包连接
    // if (!connected) {
    //   try {
    //     await dispatch(connectWallet()).unwrap();
    //   } catch (error) {
    //     message.error('请先连接钱包');
    //     return;
    //   }
    // }

    // 添加用户消息
    addMessage(inputValue);
    setInputValue('');
    setLoading(true);

    try {
      // 这里应该调用后端 AI API
      // 模拟 AI 响应
      setTimeout(async () => {
        const aiResponse = {
          strategy: {
            id: Date.now().toString(),
            name: "AI生成策略-" + Date.now(),
            frequency: "daily",
            amount: 1000,
            enablePriceCondition: true,
            priceConditionType: "below",
            priceThreshold: 35000,
            isActive: false,
            createdAt: new Date().toISOString()
          }
        };

        // 添加 AI 响应
        const responseMessage = [
          "我为您生成了一个新的投资策略：",
          `名称：${aiResponse.strategy.name}`,
          `投资金额：${aiResponse.strategy.amount} USDT`,
          `执行频率：每日`,
          `价格条件：低于 ${aiResponse.strategy.priceThreshold} USDT 时执行`,
          "",
          "需要我为您创建这个策略吗？"
        ].join('\n');

        addMessage(responseMessage, true);

        // 创建策略
        if (onStrategyCreate) {
          await dispatch(saveStrategy(aiResponse.strategy)).unwrap();
          onStrategyCreate(aiResponse.strategy);
        }

        setLoading(false);
      }, 1500);
    } catch (error) {
      message.error('生成策略失败：' + error.message);
      setLoading(false);
    }
  };

  // 处理按键事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RobotOutlined style={{ marginRight: 8 }} />
          AI 策略助手
        </div>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
        <List
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={item => (
            <List.Item style={{ padding: '8px 0' }}>
              <List.Item.Meta
                avatar={
                  <Avatar icon={item.isAI ? <RobotOutlined /> : <UserOutlined />}
                         style={{ backgroundColor: item.isAI ? '#1890ff' : '#87d068' }} />
                }
                content={
                  <div style={{
                    backgroundColor: item.isAI ? '#f5f5f5' : '#e6f7ff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    maxWidth: '80%',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {item.content}
                  </div>
                }
              />
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', marginTop: 'auto' }}>
        <Input.TextArea
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="描述您想要的投资策略..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ marginRight: 8 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
        >
          发送
        </Button>
      </div>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <Spin size="large" tip="AI正在思考..." />
        </div>
      )}
    </Card>
  );
};

export default AIStrategyChat; 