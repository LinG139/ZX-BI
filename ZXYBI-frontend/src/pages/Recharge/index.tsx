import React, {useState} from 'react';
import {Card, Button, Row, Col, Statistic, message, Modal, Radio, Tag} from 'antd';
import {StarOutlined, RocketOutlined, CheckCircleOutlined, WalletOutlined, CreditCardOutlined, AlipayCircleOutlined, WechatOutlined} from '@ant-design/icons';
import {useModel} from '@umijs/max';
import {rechargeUserCountUsingPOST} from '@/services/yubi/userController';
import {flushSync} from 'react-dom';

const Recharge: React.FC = () => {
  const {initialState, setInitialState} = useModel('@@initialState');
  const {currentUser} = initialState || {};
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [recharging, setRecharging] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('alipay');

  const plans = [
    {
      id: 'basic',
      name: '基础版',
      subtitle: '入门首选',
      price: 10,
      points: 100,
      icon: <StarOutlined />,
      color: '#8c8c8c',
      bgGradient: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
      features: ['100 积分', '基础分析功能', '普通响应速度'],
      popular: false,
    },
    {
      id: 'pro',
      name: '专业版',
      subtitle: '性价比最高',
      price: 25,
      points: 300,
      icon: <RocketOutlined />,
      color: '#1890ff',
      bgGradient: 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)',
      features: ['300 积分', '高级分析功能', '快速响应', '优先队列'],
      popular: true,
    },
    {
      id: 'vip',
      name: '旗舰版',
      subtitle: '全功能解锁',
      price: 50,
      points: 800,
      icon: <StarOutlined />,
      color: '#722ed1',
      bgGradient: 'linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)',
      features: ['800 积分', '全部功能解锁', '极速响应', '专属客服', '数据分析报告'],
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
        const newPoints = ((currentUser as any)?.leftCount || 0) + plan.points;
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
    <div style={{padding: '24px 32px', maxWidth: 1200, margin: '0 auto'}}>
      {/* 顶部积分卡片 */}
      <Card
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 40,
          border: 'none',
          overflow: 'hidden',
        }}
        bodyStyle={{padding: '32px 40px'}}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24
        }}>
          <div>
            <h2 style={{
              fontSize: 28,
              marginBottom: 8,
              color: '#fff',
              fontWeight: 600
            }}>
              选择充值套餐
            </h2>
            <p style={{opacity: 0.9, color: '#fff', fontSize: 15}}>
              一次性充值，积分永不过期
            </p>
          </div>
          <div style={{
            textAlign: 'right',
            background: 'rgba(255,255,255,0.15)',
            padding: '16px 24px',
            borderRadius: 12
          }}>
            <div style={{fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4}}>
              当前可用积分
            </div>
            <Statistic
              value={(currentUser as any)?.leftCount ?? 0}
              prefix={<StarOutlined style={{color: '#ffd700'}} />}
              valueStyle={{color: '#ffd700', fontSize: 36, fontWeight: 'bold'}}
              suffix="分"
            />
          </div>
        </div>
      </Card>

      {/* 套餐卡片 */}
      <Row gutter={[24, 24]} style={{marginBottom: 48}}>
        {plans.map((plan) => (
          <Col xs={24} md={12} lg={8} key={plan.id}>
            <Card
              style={{
                borderRadius: 16,
                border: selectedPlan === plan.id 
                  ? `2px solid ${plan.color}` 
                  : '1px solid #f0f0f0',
                background: plan.bgGradient,
                boxShadow: selectedPlan === plan.id 
                  ? `0 8px 32px ${plan.color}30` 
                  : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'visible',
                minHeight: 420,
              }}
              hoverable
              onClick={() => setSelectedPlan(plan.id)}
              bodyStyle={{padding: '28px 24px'}}
            >
              {plan.popular && (
                <Tag
                  color="#ff4d4f"
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderRadius: 20,
                    padding: '4px 16px',
                    fontSize: 12,
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(255,77,79,0.3)'
                  }}
                >
                  推荐
                </Tag>
              )}

              <div style={{textAlign: 'center'}}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: selectedPlan === plan.id ? plan.color : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: selectedPlan === plan.id ? '#fff' : plan.color,
                  fontSize: 24,
                  transition: 'all 0.3s'
                }}>
                  {plan.icon}
                </div>

                <h3 style={{
                  fontSize: 22,
                  marginBottom: 4,
                  color: '#1a1a1a',
                  fontWeight: 600
                }}>
                  {plan.name}
                </h3>
                <p style={{
                  fontSize: 13,
                  color: '#8c8c8c',
                  marginBottom: 20
                }}>
                  {plan.subtitle}
                </p>

                <div style={{marginBottom: 24}}>
                  <span style={{
                    fontSize: 42,
                    fontWeight: 700,
                    color: plan.color
                  }}>
                    ¥{plan.price}
                  </span>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: 12,
                  padding: '16px 12px',
                  marginBottom: 20
                }}>
                  <div style={{
                    fontSize: 14,
                    color: plan.color,
                    fontWeight: 600,
                    marginBottom: 12
                  }}>
                    {plan.points} 积分
                  </div>
                  <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                    {plan.features.map((feature, index) => (
                      <li key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        marginBottom: 6,
                        color: '#666',
                        fontSize: 13
                      }}>
                        <CheckCircleOutlined style={{color: '#52c41a', fontSize: 12}} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  type={selectedPlan === plan.id ? 'primary' : 'default'}
                  block
                  size="large"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                    handleRecharge();
                  }}
                  style={{
                    borderRadius: 10,
                    height: 44,
                    fontWeight: 500,
                    ...(selectedPlan === plan.id 
                      ? {background: plan.color, borderColor: plan.color}
                      : {borderColor: plan.color, color: plan.color})
                  }}
                >
                  立即充值
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 充值说明 */}
      <Card
        style={{borderRadius: 16}}
        bodyStyle={{padding: '32px 40px'}}
      >
        <Row gutter={[48, 32]}>
          {[
            {icon: <WalletOutlined />, color: '#1890ff', title: '安全支付', desc: '多重加密保障资金安全'},
            {icon: <RocketOutlined />, color: '#52c41a', title: '即时到账', desc: '充值成功后积分秒到'},
            {icon: <StarOutlined />, color: '#faad14', title: '永不过期', desc: '充值的积分长期有效'},
            {icon: <CheckCircleOutlined />, color: '#722ed1', title: '全站通用', desc: '所有功能均可使用'},
          ].map((item, index) => (
            <Col xs={12} sm={6} key={index}>
              <div style={{display: 'flex', alignItems: 'flex-start', gap: 16}}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${item.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                  fontSize: 22,
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{fontWeight: 600, marginBottom: 4, color: '#1a1a1a'}}>
                    {item.title}
                  </div>
                  <div style={{fontSize: 13, color: '#8c8c8c'}}>
                    {item.desc}
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 支付弹窗 */}
      <Modal
        title={
          <span style={{fontWeight: 600, fontSize: 18}}>
            选择支付方式
          </span>
        }
        open={showPayModal}
        onCancel={() => setShowPayModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowPayModal(false)}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={recharging} 
            onClick={handleConfirmPayment}
            style={{
              minWidth: 120,
              height: 40,
              borderRadius: 8
            }}
          >
            确认支付
          </Button>,
        ]}
        width={440}
        bodyStyle={{padding: '24px 0'}}
      >
        <Radio.Group
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 12}}
        >
          {[
            {value: 'alipay', icon: <AlipayCircleOutlined style={{fontSize: 28, color: '#1677ff'}} />, label: '支付宝'},
            {value: 'wechat', icon: <WechatOutlined style={{fontSize: 28, color: '#07c160'}} />, label: '微信支付'},
            {value: 'card', icon: <CreditCardOutlined style={{fontSize: 28, color: '#faad14'}} />, label: '银行卡'},
          ].map((method) => (
            <Radio.Button
              key={method.value}
              value={method.value}
              style={{
                width: '100%',
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingLeft: 20,
                gap: 12,
                borderRadius: 12,
                fontSize: 15
              }}
            >
              {method.icon}
              {method.label}
            </Radio.Button>
          ))}
        </Radio.Group>

        <div style={{
          marginTop: 24,
          padding: 20,
          background: '#fafafa',
          borderRadius: 12
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 12,
            fontSize: 14
          }}>
            <span style={{color: '#666'}}>充值套餐</span>
            <span style={{fontWeight: 600}}>
              {plans.find(p => p.id === selectedPlan)?.name}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 12,
            fontSize: 14
          }}>
            <span style={{color: '#666'}}>充值金额</span>
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: plans.find(p => p.id === selectedPlan)?.color
            }}>
              ¥{plans.find(p => p.id === selectedPlan)?.price}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14
          }}>
            <span style={{color: '#666'}}>获得积分</span>
            <span style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#52c41a'
            }}>
              {plans.find(p => p.id === selectedPlan)?.points} 积分
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Recharge;
