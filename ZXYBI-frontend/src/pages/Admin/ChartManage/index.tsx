import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Tag, Space, Modal, message, Input, Select, Row, Col, Statistic, Descriptions, Typography, Divider, Empty } from 'antd';
import { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  WalletOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Chart {
  id: number;
  name: string;
  goal: string;
  chartData: string;
  chartType: string;
  genChart: string;
  genResult: string;
  status: number;
  errorMessage: string;
  userId: number;
  userName?: string;
  createTime: string;
  updateTime: string;
}

interface ChartStatusStats {
  waitingCount: number;
  runningCount: number;
  successCount: number;
  failedCount: number;
  totalCount: number;
}

const ChartManage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Chart[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusStats, setStatusStats] = useState<ChartStatusStats | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentChart, setCurrentChart] = useState<Chart | null>(null);
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchData();
    fetchStatusStats();
  }, [current, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:9001/api/admin/chart/list/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current,
          pageSize,
          name: searchName || undefined,
          status: statusFilter,
        }),
      });
      const res = await response.json();
      if (res.code === 0) {
        setData(res.data.records || []);
        setTotal(res.data.total || 0);
      } else {
        message.error('获取图表列表失败: ' + res.message);
      }
    } catch (error) {
      message.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusStats = async () => {
    try {
      const response = await fetch('http://localhost:9001/api/admin/chart/status/stats', {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setStatusStats(res.data);
      }
    } catch (error) {
      message.error('获取状态统计失败');
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag icon={<ClockCircleOutlined />} color="warning">等待中</Tag>;
      case 1:
        return <Tag icon={<CheckCircleOutlined />} color="success">成功</Tag>;
      case 2:
        return <Tag icon={<LoadingOutlined />} color="processing">运行中</Tag>;
      case -1:
        return <Tag icon={<CloseCircleOutlined />} color="error">失败</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  const getChartTypeTag = (type: string) => {
    const typeMap: { [key: string]: { color: string; icon: any } } = {
      'bar': { color: 'blue', icon: <BarChartOutlined /> },
      'line': { color: 'green', icon: <BarChartOutlined /> },
      'pie': { color: 'orange', icon: <WalletOutlined /> },
      'scatter': { color: 'purple', icon: <WalletOutlined /> },
    };
    const config = typeMap[type] || { color: 'default', icon: <BarChartOutlined /> };
    return <Tag icon={config.icon} color={config.color}>{type || '未指定'}</Tag>;
  };

  const showDetail = async (chartId: number) => {
    try {
      const response = await fetch(`http://localhost:9001/api/admin/chart/get?id=${chartId}`, {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setCurrentChart(res.data);
        setDetailVisible(true);
      } else {
        message.error('获取图表详情失败');
      }
    } catch (error) {
      message.error('网络错误');
    }
  };

  const deleteChart = async (chartId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个图表吗？此操作不可恢复！',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch('http://localhost:9001/api/admin/chart/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: chartId }),
          });
          const res = await response.json();
          if (res.code === 0) {
            message.success('删除成功');
            fetchData();
            fetchStatusStats();
          } else {
            message.error('删除失败: ' + res.message);
          }
        } catch (error) {
          message.error('网络错误');
        }
      },
    });
  };

  const renderChartPreview = (chart: Chart) => {
    if (!chart.genChart || chart.status !== 1) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#999', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {chart.status === 2 && <LoadingOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
          {chart.status === 0 && <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />}
          {chart.status === -1 && <CloseCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />}
          <div style={{ marginTop: 16, fontSize: 14 }}>
            {chart.status === 2 && '图表生成中...'}
            {chart.status === 0 && '等待生成...'}
            {chart.status === -1 && '图表生成失败'}
            {chart.status !== 0 && chart.status !== 1 && chart.status !== 2 && chart.status !== -1 && '未知状态'}
          </div>
        </div>
      );
    }

    try {
      const parsedData = JSON.parse(chart.genChart);
      
      let option = null;
      if (parsedData && parsedData.option) {
        option = parsedData.option;
      } else if (typeof parsedData === 'object' && parsedData !== null && !parsedData.option) {
        option = parsedData;
      }

      if (option) {
        return (
          <div style={{ height: 450 }}>
            <ReactECharts 
              option={option} 
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        );
      }
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#999', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <BarChartOutlined style={{ fontSize: 32, color: '#ccc' }} />
          <div style={{ marginTop: 16 }}>图表数据格式错误</div>
        </div>
      );
    } catch (error) {
      console.error('图表解析失败:', error);
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#999', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
          <div style={{ marginTop: 16 }}>图表数据解析失败</div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#ccc' }}>
            {chart.genChart && chart.genChart.length > 100 ? chart.genChart.substring(0, 100) + '...' : chart.genChart}
          </div>
        </div>
      );
    }
  };

  const columns: ColumnsType<Chart> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '图表名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '图表类型',
      dataIndex: 'chartType',
      key: 'chartType',
      width: 100,
      render: (type) => getChartTypeTag(type),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      ellipsis: true,
    },
    {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
            render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
          },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record.id)}
          >
            详情
          </Button>
          <Button
            type="link"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => deleteChart(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><BarChartOutlined style={{ color: '#1890ff' }} /> 总图表</span>}
              value={statusStats?.totalCount || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><ClockCircleOutlined style={{ color: '#faad14' }} /> 等待中</span>}
              value={statusStats?.waitingCount || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><LoadingOutlined style={{ color: '#1890ff' }} /> 运行中</span>}
              value={statusStats?.runningCount || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><CheckCircleOutlined style={{ color: '#52c41a' }} /> 成功</span>}
              value={statusStats?.successCount || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><CloseCircleOutlined style={{ color: '#ff4d4f' }} /> 失败</span>}
              value={statusStats?.failedCount || 0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><CheckCircleOutlined style={{ color: '#722ed1' }} /> 成功率</span>}
              value={(statusStats?.totalCount || 0) > 0 
                ? Math.round(((statusStats?.successCount || 0) / (statusStats?.totalCount || 1)) * 100) 
                : 0}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="搜索图表名称"
            prefix={<SearchOutlined />}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="选择状态"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            style={{ width: 120 }}
            allowClear
          >
            <Option value={0}>等待中</Option>
            <Option value={1}>成功</Option>
            <Option value={2}>运行中</Option>
            <Option value={-1}>失败</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchData}>
            搜索
          </Button>
          <Button icon={<ClockCircleOutlined />} onClick={() => {
            setSearchName('');
            setStatusFilter(undefined);
            setCurrent(1);
          }}>
            重置
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title="图表详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setCurrentChart(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          <Button
            key="delete"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => {
              if (currentChart) {
                setDetailVisible(false);
                deleteChart(currentChart.id);
              }
            }}
          >
            删除图表
          </Button>,
        ]}
        width={1000}
      >
        {currentChart && (
          <div>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="图表ID">{currentChart.id}</Descriptions.Item>
              <Descriptions.Item label="图表名称">{currentChart.name}</Descriptions.Item>
              <Descriptions.Item label="图表类型">{currentChart.chartType || '未指定'}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(currentChart.status)}</Descriptions.Item>
              <Descriptions.Item label="用户ID">{currentChart.userId}</Descriptions.Item>
              <Descriptions.Item label="用户名">{currentChart.userName || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>{dayjs(currentChart.createTime).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="更新时间" span={2}>{dayjs(currentChart.updateTime).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="分析目标" span={2}>
                <Paragraph style={{ margin: 0 }}>{currentChart.goal}</Paragraph>
              </Descriptions.Item>
            </Descriptions>

            {currentChart.status === -1 && currentChart.errorMessage && (
              <>
                <Divider orientation="left">错误信息</Divider>
                <Card size="small" style={{ backgroundColor: '#fff2f0', marginBottom: 16 }}>
                  <Text type="danger">
                    <ClockCircleOutlined /> {currentChart.errorMessage}
                  </Text>
                </Card>
              </>
            )}

            {currentChart.genResult && (
              <>
                <Divider orientation="left">分析结果</Divider>
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Paragraph>
                    {currentChart.genResult}
                  </Paragraph>
                </Card>
              </>
            )}

            <Divider orientation="left">图表预览</Divider>
            <Card size="small">
              {renderChartPreview(currentChart)}
            </Card>

            {currentChart.chartData && (
              <>
                <Divider orientation="left">原始数据</Divider>
                <Card size="small">
                  <TextArea
                    value={currentChart.chartData}
                    rows={6}
                    readOnly
                    style={{ fontSize: 12 }}
                  />
                </Card>
              </>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ChartManage;