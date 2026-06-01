import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Alert, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  WindowsOutlined,
  LinuxOutlined,
  ApiOutlined,
  DatabaseOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  HeartOutlined,
  CloudServerOutlined,
  ApiFilled,
  UserOutlined,
  GlobalOutlined
} from '@ant-design/icons';

interface MonitorData {
  redisStatus: {
    connected: boolean;
    hitRate: number;
    memoryUsed: number;
    memoryTotal: number;
    opsPerSec: number;
    keysCount: number;
    dbSize: number;
  };
  mqStatus: {
    connected: boolean;
    queueSize: number;
    consumerCount: number;
    messageRate: number;
    queueName: string;
    maxQueueSize: number;
    pendingMessages: number;
  };
  aiStats: {
    totalCalls: number;
    todayCalls: number;
    successRate: number;
    avgResponseTime: number;
    totalTokens: number;
  };
  systemInfo: {
    uptime: number;
    uptimeFormatted: string;
    memoryUsage: number;
    memoryTotal: number;
    memoryFree: number;
    memoryUsedPercent: number;
    cpuUsage: number;
    availableProcessors: number;
    threadCount: number;
    peakThreadCount: number;
    requestCount: number;
    osName: string;
    osArch: string;
    osVersion: string;
    javaVersion: string;
    hostName: string;
    hostAddress: string;
    gcCount: number;
    gcTime: number;
  };
}

const Monitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonitorData | null>(null);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}天 ${hours}时 ${minutes}分 ${secs}秒`;
  };

  const getCpuStatus = (cpu: number) => {
    if (cpu >= 80) return { color: '#ff4d4f', icon: <WarningOutlined /> };
    if (cpu >= 50) return { color: '#faad14', icon: <WarningOutlined /> };
    return { color: '#52c41a', icon: <CheckCircleOutlined /> };
  };

  const getMemoryStatus = (used: number, total: number) => {
    const percent = (used / total) * 100;
    if (percent >= 80) return { color: '#ff4d4f', icon: <WarningOutlined /> };
    if (percent >= 60) return { color: '#faad14', icon: <WarningOutlined /> };
    return { color: '#52c41a', icon: <CheckCircleOutlined /> };
  };

  useEffect(() => {
    fetchMonitorData();
    const timer = setInterval(fetchMonitorData, 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchMonitorData = async () => {
    try {
      const response = await fetch('http://localhost:9001/api/admin/monitor/stats', {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setData(res.data);
      }
    } catch (error) {
      console.error('获取监控数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  const redisColumns = [
    { title: '指标', dataIndex: 'name', key: 'name' },
    { title: '值', dataIndex: 'value', key: 'value', render: (val: any) => <Tag color="blue">{val}</Tag> },
  ];

  const redisData = data?.redisStatus ? [
    { key: '1', name: '连接状态', value: data.redisStatus.connected ? <Tag color="success">已连接</Tag> : <Tag color="error">未连接</Tag> },
    { key: '2', name: '命中率', value: `${(data.redisStatus.hitRate * 100).toFixed(2)}%` },
    { key: '3', name: '内存使用', value: `${data.redisStatus.memoryUsed}MB / ${data.redisStatus.memoryTotal}MB` },
    { key: '4', name: 'OPS', value: `${data.redisStatus.opsPerSec.toFixed(0)}/s` },
    { key: '5', name: '键总数', value: data.redisStatus.keysCount },
    { key: '6', name: 'DB大小', value: data.redisStatus.dbSize },
  ] : [];

  const mqColumns = [
    { title: '指标', dataIndex: 'name', key: 'name' },
    { title: '值', dataIndex: 'value', key: 'value' },
  ];

  const mqData = data?.mqStatus ? [
    { key: '1', name: '连接状态', value: data.mqStatus.connected ? <Tag color="success">已连接</Tag> : <Tag color="error">未连接</Tag> },
    { key: '2', name: '队列名称', value: <Tag color="blue">{data.mqStatus.queueName}</Tag> },
    { key: '3', name: '队列消息数', value: data.mqStatus.queueSize },
    { key: '4', name: '消费者数量', value: data.mqStatus.consumerCount },
    { key: '5', name: '消息速率', value: `${data.mqStatus.messageRate.toFixed(2)}/s` },
    { key: '6', name: '最大队列大小', value: data.mqStatus.maxQueueSize },
  ] : [];

  const systemColumns = [
    { title: '指标', dataIndex: 'name', key: 'name' },
    { title: '值', dataIndex: 'value', key: 'value' },
  ];

  const systemData = data?.systemInfo ? [
    { key: '1', name: '系统运行时间', value: <Tag color="blue">{data.systemInfo.uptimeFormatted || formatUptime(data.systemInfo.uptime)}</Tag> },
    { key: '2', name: '内存使用', value: <Tag color="blue">{data.systemInfo.memoryUsage}MB / {data.systemInfo.memoryTotal}MB ({data.systemInfo.memoryUsedPercent}%)</Tag> },
    { key: '3', name: 'CPU 使用率', value: <Tag color="blue">{data.systemInfo.cpuUsage}%</Tag> },
    { key: '4', name: '活跃线程数', value: <Tag color="blue">{data.systemInfo.threadCount}</Tag> },
    { key: '5', name: '峰值线程数', value: <Tag color="blue">{data.systemInfo.peakThreadCount}</Tag> },
    { key: '6', name: '请求总数', value: <Tag color="blue">{data.systemInfo.requestCount}</Tag> },
    { key: '7', name: '操作系统', value: <Tag color="blue">{data.systemInfo.osName} {data.systemInfo.osVersion}</Tag> },
    { key: '8', name: 'Java版本', value: <Tag color="blue">{data.systemInfo.javaVersion}</Tag> },
    { key: '9', name: '主机名', value: <Tag color="blue">{data.systemInfo.hostName}</Tag> },
    { key: '10', name: 'GC次数', value: <Tag color="blue">{data.systemInfo.gcCount}</Tag> },
  ] : [];

  const cpuStatus = data?.systemInfo ? getCpuStatus(data.systemInfo.cpuUsage) : getCpuStatus(0);
  const memoryStatus = data?.systemInfo ? getMemoryStatus(data.systemInfo.memoryUsage, data.systemInfo.memoryTotal) : getMemoryStatus(0, 512);

  return (
    <PageContainer>
      <Alert
        message="系统监控"
        description="实时监控系统的运行状态，包括Redis缓存、消息队列、AI接口调用、系统资源等关键指标。数据每30秒自动刷新。"
        type="info"
        showIcon
        icon={<ApiOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Redis 连接状态"
              value={data?.redisStatus?.connected ? "在线" : "离线"}
              prefix={data?.redisStatus?.connected ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: data?.redisStatus?.connected ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="MQ 连接状态"
              value={data?.mqStatus?.connected ? "在线" : "离线"}
              prefix={data?.mqStatus?.connected ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: data?.mqStatus?.connected ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="AI 接口成功率"
              value={((data?.aiStats?.successRate || 0) * 100).toFixed(1)}
              suffix="%"
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="系统运行时间"
              value={formatUptime(data?.systemInfo?.uptime || 0)}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: 14 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="CPU 使用率"
              value={data?.systemInfo?.cpuUsage || 0}
              suffix="%"
              prefix={cpuStatus.icon}
              valueStyle={{ color: cpuStatus.color }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="内存使用"
              value={data?.systemInfo?.memoryUsage || 0}
              suffix="MB"
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: memoryStatus.color }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃线程数"
              value={data?.systemInfo?.threadCount || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={(data?.aiStats?.avgResponseTime || 0).toFixed(0)}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <WindowsOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                Redis 缓存状态
              </span>
            }
          >
            <Progress
              percent={data?.redisStatus ? (data.redisStatus.memoryUsed / data.redisStatus.memoryTotal * 100) : 0}
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              format={(percent) => `${data?.redisStatus?.memoryUsed || 0}MB / ${data?.redisStatus?.memoryTotal || 0}MB`}
            />
            <Table
              columns={redisColumns}
              dataSource={redisData}
              pagination={false}
              size="small"
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <LinuxOutlined style={{ color: '#ff7875', marginRight: 8 }} />
                消息队列状态
              </span>
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="队列消息数"
                  value={data?.mqStatus?.queueSize || 0}
                  prefix={<RocketOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="消费者数量"
                  value={data?.mqStatus?.consumerCount || 0}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
            </Row>
            <Table
              columns={mqColumns}
              dataSource={mqData}
              pagination={false}
              size="small"
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ApiOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                AI 接口调用统计
              </span>
            }
          >
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="今日调用次数"
                  value={data?.aiStats?.todayCalls || 0}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="累计调用次数"
                  value={data?.aiStats?.totalCalls || 0}
                  prefix={<ApiFilled />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="累计使用 Token"
                  value={data?.aiStats?.totalTokens || 0}
                  prefix={<GlobalOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <CloudServerOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                系统资源检测
              </span>
            }
          >
            <Row gutter={16}>
              <Col xs={24}>
                <Progress
                  percent={data?.systemInfo ? (data.systemInfo.cpuUsage) : 0}
                  status={data?.systemInfo?.cpuUsage !== undefined ? (data.systemInfo.cpuUsage >= 80 ? 'exception' : data.systemInfo.cpuUsage >= 50 ? 'normal' : 'success') : 'normal'}
                  strokeColor={{
                    '0%': '#52c41a',
                    '100%': '#ff4d4f',
                  }}
                  style={{ marginBottom: 16 }}
                  format={(percent) => `CPU: ${percent}%`}
                />
              </Col>
              <Col xs={24}>
                <Progress
                  percent={data?.systemInfo ? (data.systemInfo.memoryUsage / data.systemInfo.memoryTotal * 100) : 0}
                  status={data?.systemInfo ? (data.systemInfo.memoryUsage / data.systemInfo.memoryTotal >= 0.8 ? 'exception' : data.systemInfo.memoryUsage / data.systemInfo.memoryTotal >= 0.6 ? 'normal' : 'success') : 'normal'}
                  strokeColor={{
                    '0%': '#52c41a',
                    '100%': '#ff4d4f',
                  }}
                  format={(percent) => `内存: ${percent}%`}
                />
              </Col>
            </Row>
            <Table
              columns={systemColumns}
              dataSource={systemData}
              pagination={false}
              size="small"
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Monitor;