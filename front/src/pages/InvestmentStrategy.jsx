import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Table, Tag, Button, Modal, Form, Input, Select, InputNumber, Switch, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { saveStrategy, setActiveStrategy, deleteStrategy } from '../store/slices/strategySlice';
import AIStrategyChat from '../components/AIStrategyChat';

const { Option } = Select;

const InvestmentStrategy = () => {
  const dispatch = useDispatch();
  const { savedStrategies, activeStrategy } = useSelector(state => state.strategy);
  const { currentPrice } = useSelector(state => state.marketData);
  const [form] = Form.useForm();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // 表格列定义
  const columns = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '运行中' : '已暂停'}
        </Tag>
      ),
    },
    {
      title: '定投金额 (USD)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${Number(amount).toLocaleString()}`,
    },
    {
      title: '频率',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (frequency) => ({
        daily: '每日',
        weekly: '每周',
        monthly: '每月',
      }[frequency]),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div className="space-x-2">
          <Button
            type="text"
            icon={record.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => toggleStrategy(record)}
          >
            {record.isActive ? '暂停' : '启动'}
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  // 处理策略创建/编辑
  const handleSubmit = async (values) => {
    const strategy = {
      id: editingStrategy?.id || Date.now().toString(),
      ...values,
      createdAt: editingStrategy?.createdAt || new Date().toISOString(),
      isActive: editingStrategy?.isActive ?? true,
    };

    try {
      await dispatch(saveStrategy(strategy)).unwrap();
      message.success(`${editingStrategy ? '更新' : '创建'}策略成功`);
      setIsModalVisible(false);
      form.resetFields();
      setEditingStrategy(null);
    } catch (error) {
      message.error(`${editingStrategy ? '更新' : '创建'}策略失败: ${error.message}`);
    }
  };

  // 处理编辑
  const handleEdit = (strategy) => {
    setEditingStrategy(strategy);
    form.setFieldsValue(strategy);
    setIsModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (strategy) => {
    try {
      await dispatch(deleteStrategy(strategy.id)).unwrap();
      message.success('删除策略成功');
    } catch (error) {
      message.error('删除策略失败: ' + error.message);
    }
  };

  // 切换策略状态
  const toggleStrategy = async (strategy) => {
    try {
      await dispatch(saveStrategy({
        ...strategy,
        isActive: !strategy.isActive,
      })).unwrap();
      message.success(`${strategy.isActive ? '暂停' : '启动'}策略成功`);
    } catch (error) {
      message.error(`${strategy.isActive ? '暂停' : '启动'}策略失败: ${error.message}`);
    }
  };

  // 处理 AI 生成的策略
  const handleStrategyCreate = (strategy) => {
    handleEdit(strategy);
  };

  return (
    <div className="p-4">
      <Row gutter={16}>
        <Col span={showChat ? 16 : 24}>
          <Card
            title="投资策略"
            extra={
              <div className="space-x-2">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingStrategy(null);
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                >
                  创建策略
                </Button>
                <Button
                  onClick={() => setShowChat(!showChat)}
                >
                  {showChat ? '隐藏AI助手' : '显示AI助手'}
                </Button>
              </div>
            }
          >
            <Table
              columns={columns}
              dataSource={savedStrategies}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
        
        {showChat && (
          <Col span={8}>
            <AIStrategyChat onStrategyCreate={handleStrategyCreate} />
          </Col>
        )}
      </Row>

      <Modal
        title={editingStrategy ? '编辑策略' : '创建策略'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingStrategy(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            frequency: 'weekly',
            enablePriceCondition: false,
            priceConditionType: 'below',
            enableDynamicAmount: false,
            dynamicAmountType: 'increase',
          }}
        >
          <Form.Item
            name="name"
            label="策略名称"
            rules={[{ required: true, message: '请输入策略名称' }]}
          >
            <Input placeholder="例如：每周定投" />
          </Form.Item>

          <Form.Item
            name="frequency"
            label="定投频率"
            rules={[{ required: true, message: '请选择定投频率' }]}
          >
            <Select>
              <Option value="daily">每日</Option>
              <Option value="weekly">每周</Option>
              <Option value="monthly">每月</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.frequency !== currentValues.frequency}
          >
            {({ getFieldValue }) => {
              const frequency = getFieldValue('frequency');
              if (frequency === 'weekly') {
                return (
                  <Form.Item
                    name="dayOfWeek"
                    label="每周几执行"
                    rules={[{ required: true, message: '请选择执行日' }]}
                  >
                    <Select>
                      <Option value="1">周一</Option>
                      <Option value="2">周二</Option>
                      <Option value="3">周三</Option>
                      <Option value="4">周四</Option>
                      <Option value="5">周五</Option>
                      <Option value="6">周六</Option>
                      <Option value="0">周日</Option>
                    </Select>
                  </Form.Item>
                );
              }
              if (frequency === 'monthly') {
                return (
                  <Form.Item
                    name="dayOfMonth"
                    label="每月几号执行"
                    rules={[{ required: true, message: '请选择执行日期' }]}
                  >
                    <Select>
                      {[...Array(28)].map((_, i) => (
                        <Option key={i + 1} value={String(i + 1)}>
                          {i + 1}日
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="amount"
            label="定投金额 (USD)"
            rules={[{ required: true, message: '请输入定投金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="例如：100"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="enablePriceCondition"
            label="价格条件"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.enablePriceCondition !== currentValues.enablePriceCondition}
          >
            {({ getFieldValue }) => {
              const enablePriceCondition = getFieldValue('enablePriceCondition');
              if (!enablePriceCondition) return null;
              return (
                <>
                  <Form.Item
                    name="priceConditionType"
                    label="条件类型"
                    rules={[{ required: true, message: '请选择条件类型' }]}
                  >
                    <Select>
                      <Option value="below">价格低于</Option>
                      <Option value="above">价格高于</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="priceThreshold"
                    label="价格阈值 (USD)"
                    rules={[{ required: true, message: '请输入价格阈值' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      placeholder={`当前价格: ${currentPrice ? '$' + currentPrice.toLocaleString() : '加载中...'}`}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingStrategy ? '更新策略' : '创建策略'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InvestmentStrategy;
