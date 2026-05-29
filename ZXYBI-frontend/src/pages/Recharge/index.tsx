import React, {useState} from 'react';
import {Card, Button, Row, Col, Statistic, message, Tag, Modal, Radio} from 'antd';
import {StarOutlined, RocketOutlined, CheckCircleOutlined, WalletOutlined, CreditCardOutlined, AlipayCircleOutlined, WechatOutlined} from '@ant-design/icons';
import {useModel} from '@umijs/max';
import {rechargeUserCountUsingPOST} from '@/services/yubi/userController';
import {flushSync} from 'react-dom';

const Recharge: React.FC = () => {
  const {initialState, setInitialState} = useModel('@@initialState');
  const {currentUser} = initialState || {};
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [recharging, setRecharging] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('alipay');

  const plans = [
    {
      id: 'basic',
      name: '基础套餐',
      price: 10,
      points: 100,
      icon: <StarOutlined style={{fontSize: 24}} />,
      color: 'gold',
      features: ['100积分', '基础分析功能', '普通响应速度'],
      popular: false,
    },
    {
      id: 'pro',
      name: '专业套餐',
      price: 25,
      points: 300,
      icon: <RocketOutlined style={{fontSize: 24}} />,
      color: 'blue',
      features: ['300积分', '高级分析功能', '快速响应', '优先队列'],
      popular: true,
    },
    {
      id: 'vip',
      name: 'VIP套餐',
      price: 50,
      points: 800,
      icon: <StarOutlined style={{fontSize: 24}} />,
      color: 'purple',
      features: ['800积分', '全部功能解锁', '极速响应', '专属客服', '数据分析报告'],
      popular: false,
    },
  ];

  const handleRecharge = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) {
      message.error('请选择充值套餐');
      return;
    }
    setShowPayModal(true);
  };

  const handleConfirmPayment = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;
    
    setRecharging(true);
    try {
      const res = await rechargeUserCountUsingPOST({ params: { count: plan.points } });
      if (res.code === 0) {
        const newPoints = (currentUser?.leftCount || 0) + plan.points;
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: {
              ...s?.currentUser,
              leftCount: newPoints,
            } as API.LoginUserVO,
          }));
        });
        message.success(`充值成功！已获得 ${plan.points} 积分，当前积分：${newPoints}`);
        setShowPayModal(false);
      } else {
        message.error(res.message || '充值失败');
      }
    } catch (e: any) {
      message.error(e.message || '充值失败');
    } finally {
      setRecharging(false);
    }
  };

  return (
    <div style={{padding: '24px'}}>
      <Card
        style={{
          borderRadius: 12,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 24,
          border: 'none',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff'}}>
          <div>
            <h2 style={{fontSize: 24, marginBottom: 8}}>积分充值中心</h2>
            <p style={{opacity: 0.9}}>选择合适的套餐，开启您的数据分析之旅</p>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: 14, opacity: 0.9, marginBottom: 4}}>当前剩余积分</div>
            <Statistic
              value={currentUser?.leftCount ?? 0}
              prefix={<StarOutlined style={{color: '#ffd700'}} />}
              valueStyle={{color: '#ffd700', fontSize: 32, fontWeight: 'bold'}}
            />
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {plans.map((plan) => (
          <Col xs={24} sm={12} lg={8} key={plan.id}>
            <Card
              style={{
                borderRadius: 12,
                height: '100%',
                border: selectedPlan === plan.id ? `2px solid ${plan.color === 'gold' ? '#faad14' : plan.color === 'blue' ? '#1890ff' : '#722ed1'}` : '1px solid #e8e8e8',
                boxShadow: selectedPlan === plan.id ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.3s ease',
              }}
              hoverable
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div style={{textAlign: 'center'}}>
                {plan.popular && (
                  <Tag color="red" style={{marginBottom: 12}}>
                    最受欢迎
                  </Tag>
                )}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    backgroundColor: plan.color === 'gold' ? '#fffbe6' : plan.color === 'blue' ? '#e6f7ff' : '#f9f0ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: plan.color === 'gold' ? '#faad14' : plan.color === 'blue' ? '#1890ff' : '#722ed1',
                  }}
                >
                  {plan.icon}
                </div>
                <h3 style={{fontSize: 18, marginBottom: 8}}>{plan.name}</h3>
                <div style={{marginBottom: 16}}>
                  <span style={{fontSize: 32, fontWeight: 'bold', color: '#1890ff'}}>¥{plan.price}</span>
                  <span style={{color: '#999', marginLeft: 8}}>充值 {plan.points} 积分</span>
                </div>
                <div style={{borderTop: '1px solid #e8e8e8', paddingTop: 16, marginBottom: 16}}>
                  <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                    {plan.features.map((feature, index) => (
                      <li key={index} style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#666'}}>
                        <CheckCircleOutlined style={{color: '#52c41a', fontSize: 14}} />
                        <span style={{fontSize: 13}}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  type={selectedPlan === plan.id ? 'primary' : 'default'}
                  block
                  style={{
                    marginTop: 16,
                    borderRadius: 8,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRecharge();
                  }}
                  loading={recharging}
                >
                  立即充值
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        style={{borderRadius: 12, marginTop: 24}}
        title="充值说明"
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <div style={{display: 'flex', gap: 12}}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#e6f7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1890ff',
                }}
              >
                <WalletOutlined style={{fontSize: 24}} />
              </div>
              <div>
                <div style={{fontWeight: 'bold', marginBottom: 4}}>安全支付</div>
                <div style={{fontSize: 13, color: '#666'}}>支持多种支付方式，安全可靠</div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{display: 'flex', gap: 12}}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#f6ffed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#52c41a',
                }}
              >
                <RocketOutlined style={{fontSize: 24}} />
              </div>
              <div>
                <div style={{fontWeight: 'bold', marginBottom: 4}}>即时到账</div>
                <div style={{fontSize: 13, color: '#666'}}>充值成功后积分立即到账</div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{display: 'flex', gap: 12}}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#fffbe6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#faad14',
                }}
              >
                <StarOutlined style={{fontSize: 24}} />
              </div>
              <div>
                <div style={{fontWeight: 'bold', marginBottom: 4}}>积分永不过期</div>
                <div style={{fontSize: 13, color: '#666'}}>充值的积分永久有效</div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div style={{display: 'flex', gap: 12}}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#f9f0ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#722ed1',
                }}
              >
                <StarOutlined style={{fontSize: 24}} />
              </div>
              <div>
                <div style={{fontWeight: 'bold', marginBottom: 4}}>专属权益</div>
                <div style={{fontSize: 13, color: '#666'}}>VIP用户享受专属服务</div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Modal
        title="选择支付方式"
        visible={showPayModal}
        onCancel={() => setShowPayModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowPayModal(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" loading={recharging} onClick={handleConfirmPayment}>
            确认支付
          </Button>,
        ]}
      >
        <div style={{padding: '16px 0'}}>
          <Radio.Group
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="alipay" style={{width: '100%', marginBottom: 8}}>
              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                <AlipayCircleOutlined style={{fontSize: 24, color: '#1677ff'}} />
                <span>支付宝</span>
              </span>
            </Radio.Button>
            <Radio.Button value="wechat" style={{width: '100%', marginBottom: 8}}>
              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                <WechatOutlined style={{fontSize: 24, color: '#52c41a'}} />
                <span>微信支付</span>
              </span>
            </Radio.Button>
            <Radio.Button value="card" style={{width: '100%'}}>
              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                <CreditCardOutlined style={{fontSize: 24, color: '#faad14'}} />
                <span>银行卡</span>
              </span>
            </Radio.Button>
          </Radio.Group>
        </div>
        <div style={{paddingTop: 16, borderTop: '1px solid #e8e8e8'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{color: '#666'}}>充值金额</span>
            <span style={{fontSize: 18, fontWeight: 'bold', color: '#1890ff'}}>
              ¥{plans.find(p => p.id === selectedPlan)?.price}
            </span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
            <span style={{color: '#666'}}>获得积分</span>
            <span style={{fontSize: 18, fontWeight: 'bold', color: '#52c41a'}}>
              {plans.find(p => p.id === selectedPlan)?.points} 积分
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Recharge;
