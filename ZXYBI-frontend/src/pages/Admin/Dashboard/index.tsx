import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row, Statistic, Spin, Tag, Progress, App as AntApp } from 'antd';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  UserOutlined,
  BarChartOutlined,
  CommentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  WalletOutlined,
  RiseOutlined,
  TeamOutlined,
  CalendarOutlined
} from '@ant-design/icons';

interface DashboardData {
  totalUsers: number;
  todayNewUsers: number;
  totalCharts: number;
  todayNewCharts: number;
  totalAiSessions: number;
  totalAiChats: number;
  todayNewChats: number;
  waitingCharts: number;
  runningCharts: number;
  successCharts: number;
  failedCharts: number;
  totalUserPoints: number;
  userTrend: Array<{ date: string; count: number }>;
  chartTrend: Array<{ date: string; count: number }>;
  weekStats: {
    userGrowth: number;
    chartGrowth: number;
    aiGrowth: number;
  };
}

const Dashboard: React.FC = () => {
  const { message: antMessage } = AntApp.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:9001/api/admin/dashboard', {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setData(res.data);
      } else {
        antMessage.error('获取数据失败: ' + res.message);
      }
    } catch (error) {
      antMessage.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />
      </PageContainer>
    );
  }

  const userTrendOption = {
    title: {
      text: '用户增长趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data?.userTrend?.map((item) => item.date) || [],
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        data: data?.userTrend?.map((item) => item.count) || [],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };

  const chartTrendOption = {
    title: {
      text: '图表生成趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data?.chartTrend?.map((item) => item.date) || [],
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        data: data?.chartTrend?.map((item) => item.count) || [],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#52c41a' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ],
          },
        },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };

  const pieOption = {
    title: {
      text: '图表状态分布',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: '图表状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: data?.waitingCharts || 0, name: '等待中', itemStyle: { color: '#faad14' } },
          { value: data?.runningCharts || 0, name: '运行中', itemStyle: { color: '#1890ff' } },
          { value: data?.successCharts || 0, name: '成功', itemStyle: { color: '#52c41a' } },
          { value: data?.failedCharts || 0, name: '失败', itemStyle: { color: '#ff4d4f' } },
        ]
      }
    ]
  };

  const totalCharts = (data?.totalCharts || 0);
  const successRate = totalCharts > 0 ? ((data?.successCharts || 0) / totalCharts * 100).toFixed(1) : 0;

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="总用户数"
              value={data?.totalUsers || 0}
              prefix={<TeamOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <RiseOutlined /> +{data?.todayNewUsers || 0} 今日
                </span>
              }
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="总图表数"
              value={data?.totalCharts || 0}
              prefix={<BarChartOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <RiseOutlined /> +{data?.todayNewCharts || 0} 今日
                </span>
              }
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="AI对话总数"
              value={data?.totalAiChats || 0}
              prefix={<CommentOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <RiseOutlined /> +{data?.todayNewChats || 0} 今日
                </span>
              }
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="用户总积分"
              value={data?.totalUserPoints || 0}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="图表生成统计" style={{ marginTop: 16 }} hoverable>
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span><ClockCircleOutlined style={{ color: '#faad14' }} /> 等待中</span>}
              value={data?.waitingCharts || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span><LoadingOutlined style={{ color: '#1890ff' }} /> 运行中</span>}
              value={data?.runningCharts || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span><CheckCircleOutlined style={{ color: '#52c41a' }} /> 成功</span>}
              value={data?.successCharts || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title={<span><CloseCircleOutlined style={{ color: '#ff4d4f' }} /> 失败</span>}
              value={data?.failedCharts || 0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>
        <Progress
          percent={parseFloat(successRate)}
          strokeColor={{
            '0%': '#ff4d4f',
            '50%': '#faad14',
            '100%': '#52c41a',
          }}
          format={(percent) => `成功率 ${percent}%`}
          style={{ marginTop: 16 }}
        />
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card hoverable>
            <ReactECharts option={userTrendOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card hoverable>
            <ReactECharts option={chartTrendOption} style={{ height: 320 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card hoverable>
            <ReactECharts option={pieOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="数据总览" hoverable>
            <div style={{ padding: '20px 0' }}>
              <Row gutter={[16, 24]}>
                <Col span={12}>
                  <Statistic
                    title="总会话数"
                    value={data?.totalAiSessions || 0}
                    prefix={<CommentOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="总图表数"
                    value={data?.totalCharts || 0}
                    prefix={<BarChartOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="图表成功率"
                    value={successRate}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="失败图表"
                    value={data?.failedCharts || 0}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <Tag icon={<CalendarOutlined />} color="blue">数据更新于: {new Date().toLocaleString()}</Tag>
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;