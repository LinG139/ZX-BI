import {PageContainer} from '@ant-design/pro-components';
import {useModel} from '@umijs/max';
import {Card, theme, Row, Col, Statistic, Button, Avatar, Tag, List, Space, Spin, Tooltip, Progress, Timeline} from 'antd';
import {
  BarChartOutlined,
  CloudUploadOutlined,
  HistoryOutlined,
  MessageOutlined,
  UserOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  StarOutlined,
  ReloadOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  FallOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import React, {useEffect, useState} from 'react';
import {history} from '@umijs/max';
import {listMyChartVOByPageUsingPOST} from '@/services/yubi/chartController';
import moment from 'moment';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
}> = ({title, href, index, desc}) => {
  const {useToken} = theme;
  const {token} = useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              'url(\'https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg\')',
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
      <a href={href} target="_blank" rel="noreferrer">
        了解更多 {'>'}
      </a>
    </div>
  );
};

const Welcome: React.FC = () => {
  const {token} = theme.useToken();
  const {initialState} = useModel('@@initialState');
  const {currentUser} = initialState || {};
  const [chartStats, setChartStats] = useState({total: 0, success: 0, failed: 0});
  const [recentCharts, setRecentCharts] = useState<API.Chart[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChartStats();
  }, []);

  const loadChartStats = async () => {
    setLoading(true);
    try {
      const res = await listMyChartVOByPageUsingPOST({
        current: 1,
        pageSize: 20,
      });
      if (res.code === 0 && res.data) {
        const records = res.data.records || [];
        const total = res.data.total || 0;
        const pageSuccess = records.filter(r => r.execMessage === '成功').length;
        const pageFailed = records.filter(r => r.execMessage === '失败').length;
        
        setChartStats({
          total: total,
          success: pageSuccess,
          failed: pageFailed,
        });
        setRecentCharts(records.slice(0, 7));
      }
    } catch (e) {
      console.error('加载图表统计失败', e);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <CloudUploadOutlined style={{fontSize: 32, color: '#1890ff'}} />,
      title: '上传数据',
      desc: '上传Excel/CSV文件',
      color: '#e6f7ff',
      path: '/add_chart',
    },
    {
      icon: <BarChartOutlined style={{fontSize: 32, color: '#52c41a'}} />,
      title: '智能分析',
      desc: 'AI驱动的数据分析',
      color: '#f6ffed',
      path: '/add_chart_mq',
    },
    {
      icon: <HistoryOutlined style={{fontSize: 32, color: '#faad14'}} />,
      title: '我的图表',
      desc: '查看历史记录',
      color: '#fffbe6',
      path: '/my_chart',
    },
    {
      icon: <MessageOutlined style={{fontSize: 32, color: '#722ed1'}} />,
      title: 'AI助手',
      desc: '智能对话助手',
      color: '#f9f0ff',
      path: '/story',
    },
  ];

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            style={{borderRadius: 8, marginBottom: 16}}
            bodyStyle={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 8,
            }}
          >
            <Row gutter={24} align="middle">
              <Col flex="none">
                <Avatar
                  size={72}
                  src={currentUser?.userAvatar}
                  icon={<UserOutlined />}
                  style={{border: '3px solid rgba(255,255,255,0.5)'}}
                />
              </Col>
              <Col flex="auto">
                <div style={{color: '#fff'}}>
                  <h1 style={{fontSize: 24, marginBottom: 8, color: '#fff'}}>
                    欢迎回来，{currentUser?.userName || '用户'}！
                  </h1>
                  <p style={{fontSize: 14, opacity: 0.9, marginBottom: 12}}>
                    今天是数据分析的好日子，让我们一起探索数据的价值
                  </p>
                  <Space wrap>
                    <Tag color="gold" icon={<StarOutlined />}>
                      剩余积分: {currentUser?.leftCount ?? 0}
                    </Tag>
                    <Tag color="blue">
                      {currentUser?.userRole === 'admin' ? '管理员' : '普通用户'}
                    </Tag>
                    <Tag color="cyan" icon={<ClockCircleOutlined />}>
                      注册于 {moment(currentUser?.createTime).format('MM-DD HH:mm') || '未知'}
                    </Tag>
                  </Space>
                </div>
              </Col>
              <Col flex="none">
                <div style={{textAlign: 'center', color: '#fff'}}>
                  <Tooltip title="成功率">
                    <Progress
                      type="circle"
                      percent={chartStats.total > 0 ? Math.round((chartStats.success / chartStats.total) * 100) : 0}
                      size={60}
                      strokeColor={{'0%': '#52c41a', '100%': '#52c41a'}}
                      format={(percent) => <span style={{color: '#fff', fontSize: 12}}>{percent}%</span>}
                    />
                    <div style={{fontSize: 12, marginTop: 4}}>成功率</div>
                  </Tooltip>
                </div>
              </Col>
            </Row>
          </Card>

          <Card
            title={<span><RocketOutlined style={{marginRight: 8}} />快捷入口</span>}
            style={{borderRadius: 8, marginBottom: 16}}
          >
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={12} sm={6} key={index}>
                  <div
                    style={{
                      borderRadius: 8,
                      backgroundColor: action.color,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: '24px 16px',
                    }}
                    className="quick-action-card"
                    onClick={() => history.push(action.path)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{marginBottom: 12, transition: 'transform 0.3s ease'}}>{action.icon}</div>
                    <div style={{fontWeight: 'bold', marginBottom: 4}}>{action.title}</div>
                    <div style={{fontSize: 12, color: '#666'}}>{action.desc}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          <Card
            title={<span><BarChartOutlined style={{marginRight: 8}} />我的图表</span>}
            extra={
              <Button type="link" onClick={() => history.push('/my_chart')}>
                查看全部 <ArrowRightOutlined />
              </Button>
            }
            style={{borderRadius: 8}}
          >
            {recentCharts.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={recentCharts}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Tag key="type" color="blue">{item.chartType || '未知'}</Tag>,
                      <Tag key="status" color={item.execMessage === '成功' ? 'green' : item.execMessage === '失败' ? 'red' : 'orange'}>
                        {item.execMessage}
                      </Tag>,
                      <Button
                        type="link"
                        key="detail"
                        onClick={() => history.push(`/chart_detail/${item.id}`)}
                      >
                        详情
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<DatabaseOutlined style={{fontSize: 24, color: '#1890ff'}} />}
                      title={<a onClick={() => history.push('/my_chart')}>{item.name}</a>}
                      description={
                        <Space size="large">
                          <span>{item.goal?.substring(0, 30)}{item.goal?.length > 30 ? '...' : ''}</span>
                          <span style={{color: '#999', fontSize: 12}}>
                            <ClockCircleOutlined style={{marginRight: 4}} />
                            {moment(item.createTime).format('MM-DD HH:mm')}
                          </span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{textAlign: 'center', padding: '40px 0', color: '#999'}}>
                <BarChartOutlined style={{fontSize: 48, marginBottom: 16}} />
                <p>暂无图表记录</p>
                <Button type="primary" onClick={() => history.push('/add_chart')}>
                  创建第一个图表
                </Button>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<span><SafetyOutlined style={{marginRight: 8}} />数据统计</span>}
            extra={
              <Tooltip title="刷新数据">
                <Button
                  type="text"
                  icon={<ReloadOutlined spin={loading} />}
                  onClick={loadChartStats}
                  loading={loading}
                />
              </Tooltip>
            }
            style={{borderRadius: 8, marginBottom: 16}}
          >
            <Spin spinning={loading}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="总图表数"
                    value={chartStats.total}
                    prefix={<BarChartOutlined />}
                    valueStyle={{color: '#1890ff'}}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="成功生成"
                    value={chartStats.success}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{color: '#52c41a'}}
                    suffix={
                      chartStats.total > 0 ? (
                        <span style={{fontSize: 12, color: '#999', marginLeft: 4}}>
                          ({Math.round((chartStats.success / chartStats.total) * 100)}%)
                        </span>
                      ) : null
                    }
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="生成失败"
                    value={chartStats.failed}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{color: '#ff4d4f'}}
                    suffix={
                      chartStats.total > 0 ? (
                        <span style={{fontSize: 12, color: '#999', marginLeft: 4}}>
                          ({Math.round((chartStats.failed / chartStats.total) * 100)}%)
                        </span>
                      ) : null
                    }
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="剩余积分"
                    value={currentUser?.leftCount ?? 0}
                    prefix={<StarOutlined />}
                    valueStyle={{color: '#faad14'}}
                  />
                </Col>
              </Row>
            </Spin>
          </Card>

          <Card
            title={<span><RocketOutlined style={{marginRight: 8}} />快速开始</span>}
            style={{borderRadius: 8, marginBottom: 16}}
          >
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#1890ff',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 12,
                }}>1</div>
                <span>上传你的数据文件（Excel/CSV）</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#52c41a',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 12,
                }}>2</div>
                <span>描述你的分析需求</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#faad14',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 12,
                }}>3</div>
                <span>AI自动生成可视化图表</span>
              </div>
              <Button
                type="primary"
                block
                icon={<RocketOutlined />}
                style={{marginTop: 12}}
                onClick={() => history.push('/add_chart')}
              >
                立即开始
              </Button>
            </div>
          </Card>

          <Card
            title="产品特点"
            style={{borderRadius: 8}}
            bodyStyle={{padding: '12px 16px'}}
          >
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              {[
                'AI智能分析，一键生成图表',
                '支持多种图表类型',
                '数据安全加密存储',
                '7x24小时在线服务',
              ].map((feature, index) => (
                <div key={index} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <StarOutlined style={{color: '#faad14', fontSize: 12}} />
                  <span style={{fontSize: 13}}>{feature}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title={<span><BellOutlined style={{marginRight: 8}} />系统动态</span>}
            style={{borderRadius: 8, marginTop: 16}}
          >
            <Timeline
              items={[
                {
                  color: 'green',
                  dot: <CheckCircleOutlined />,
                  children: (
                    <div>
                      <div style={{fontWeight: 'bold'}}>系统运行正常</div>
                      <div style={{fontSize: 12, color: '#999'}}>所有服务在线</div>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  dot: <ThunderboltOutlined />,
                  children: (
                    <div>
                      <div style={{fontWeight: 'bold'}}>AI模型已更新</div>
                      <div style={{fontSize: 12, color: '#999'}}>分析能力提升20%</div>
                    </div>
                  ),
                },
                {
                  color: 'orange',
                  dot: <ExclamationCircleOutlined />,
                  children: (
                    <div>
                      <div style={{fontWeight: 'bold'}}>积分系统上线</div>
                      <div style={{fontSize: 12, color: '#999'}}>更多功能等你体验</div>
                    </div>
                  ),
                },
                {
                  color: 'gray',
                  dot: <ClockCircleOutlined />,
                  children: (
                    <div>
                      <div style={{fontWeight: 'bold'}}>欢迎使用智析BI</div>
                      <div style={{fontSize: 12, color: '#999'}}>开始你的数据分析之旅</div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: 8,
          marginTop: 16,
        }}
        bodyStyle={{
          backgroundImage:
            initialState?.currentUser?.userRole === 'admin'
              ? 'linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              'url(\'https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ\')',
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: token.colorTextHeading,
            }}
          >
            关于 智析云 BI
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              marginTop: 24,
            }}
          >
            <InfoCard
              index={3}
              href="https://github.com/LinG139/ZX-BI"
              title="项目介绍"
              desc="这是一个创新的数据分析工具，与传统的BI完全不同。我们的项目利用AI技术，以完全新颖的方式帮助用户进行数据分析，节约人力成本并提高效率。分别采用了线程池和消息队列来提升用户的体验和加强信息的可靠性,后端自定义 Prompt 预设模板并封装用户输入的数据和分析诉求，通过对接 AIGC 接口生成可视化图表由于 AIGC 的输入 Token 限制，使用 Easy Excel 解析用户上传的 XLSX 表格数据文件并压缩为 CSV，实测提高了 20% 的单次输入数据量、并节约了成本。"
            />
            <InfoCard
              index={1}
              title="什么是BI?"
              href={''}
              desc="BI是商业智能（Business Intelligence）的缩写。它是一种通过收集、分析和呈现数据来帮助企业做出更好决策的技术和过程。BI通常涉及使用各种数据仓库、数据挖掘和数据分析工具，以提取有关企业绩效、市场趋势、客户行为等方面的信息。这些数据可以被转化为可视化图表、报表和仪表盘，可协助企业管理层了解他们所运营的公司的情况，并根据这些信息制定更明智的商业决策。"
            />
            <InfoCard
              index={2}
              title="BI 平台的优点"
              href="add_chart"
              desc="自动化数据分析：项目采用AI技术，能够自动化地从原始数据中生成符合要求的图表和分析结论。用户只需要输入分析目标和原始数据，无需具备专业的数据分析知识，即可完成数据分析的过程。可视化结果：通过使用AI接口生成分析结果，该项目能够实现将数据以可视化的方式展示出来，使用户更容易理解和解读数据，从而做出更明智的决策。"
            />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Welcome;