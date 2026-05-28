import {getChartVOByIdUsingGET} from '@/services/yubi/chartController';
import {optimizeChartOption} from '@/utils/chartOptimizer';
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  PieChartOutlined,
  TableOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {Button, Card, Col, Descriptions, Divider, Empty, message, Row, Space, Spin, Tag, Typography} from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {history, useParams} from 'umi';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

const {Title, Paragraph} = Typography;

const ChartDetailPage: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const [loading, setLoading] = useState<boolean>(true);
  const [chart, setChart] = useState<API.Chart>();
  const [activeKey, setActiveKey] = useState<string>('chart');
  const chartRef = useRef<ReactECharts>(null);

  const handleDownload = () => {
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      const dataURL = echartsInstance.getDataURL({
        type: 'png',
        pixelRatio: 3,
        backgroundColor: '#fff',
      });
      const link = document.createElement('a');
      link.download = `${chart?.name || '图表'}_${dayjs().format('YYYYMMDDHHmmss')}.png`;
      link.href = dataURL;
      link.click();
      message.success('图片下载成功！');
    }
  };

  useEffect(() => {
    loadChartDetail();
  }, [id]);

  const loadChartDetail = async () => {
    if (!id) {
      message.error('图表ID不存在');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getChartVOByIdUsingGET({id: id});
      if (res.code === 0 && res.data) {
        setChart(res.data);
      } else {
        message.error(res.message || '获取图表详情失败');
      }
    } catch (e: any) {
      console.error('加载图表详情失败', e);
      message.error(e?.message || '加载图表详情失败');
    } finally {
      setLoading(false);
    }
  };

  const safeParseJSON = (jsonString: string | undefined, chartName?: string) => {
    if (!jsonString) return {};
    try {
      const parsed = JSON.parse(jsonString);
      const optimized = optimizeChartOption(parsed);
      if (chartName && optimized) {
        optimized.title = {
          text: chartName,
          left: 'center',
          top: 10,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
          },
        };
        if (optimized.grid) {
          optimized.grid.top = optimized.grid.top > 60 ? optimized.grid.top : 80;
        } else {
          optimized.grid = { top: 80 };
        }
      }
      return optimized;
    } catch (error) {
      console.error('JSON 解析失败:', error);
      return {};
    }
  };

  const getChartTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pie':
      case '饼图':
        return <PieChartOutlined />;
      case 'line':
      case '折线图':
        return <FieldTimeOutlined />;
      case 'bar':
      case '柱状图':
        return <BarChartOutlined />;
      default:
        return <TableOutlined />;
    }
  };

  const chartData = chart ? safeParseJSON(chart.chartData) : {};
  const genChart = chart ? safeParseJSON(chart.genChart, chart.name) : {};

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!chart) {
    return (
      <Card>
        <Empty description="图表不存在或已被删除" />
        <div style={{textAlign: 'center', marginTop: 16}}>
          <Button type="primary" onClick={() => history.push('/my_chart')}>返回我的图表</Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{padding: '0 0 24px 0'}}>
      <Card
        title={
          <span>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => history.goBack()}
              style={{marginRight: 8}}
            />
            图表详情
          </span>
        }
        extra={
          <Button type="primary" onClick={() => history.push('/my_chart')}>
            返回列表
          </Button>
        }
        style={{borderRadius: 8}}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={18}>
            <Card
              title={
                <span>
                  <BarChartOutlined style={{marginRight: 8}} />
                  {chart.name}
                </span>
              }
              extra={
                <Space>
                  <Tag color={chart.execMessage === '成功' ? 'green' : chart.execMessage === '失败' ? 'red' : 'orange'}>
                    {chart.execMessage}
                  </Tag>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    disabled={chart.execMessage !== '成功'}
                  >
                    下载高清图片
                  </Button>
                </Space>
              }
              style={{height: 400}}
            >
              {chart.execMessage === '成功' && genChart ? (
                <ReactECharts
                  ref={chartRef}
                  option={genChart}
                  style={{height: 340}}
                />
              ) : (
                <Empty
                  description={
                    chart.execMessage === '失败'
                      ? `失败原因：${chart.execMessage || '未知错误'}`
                      : '图表正在生成中，请稍后再试...'
                  }
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={6}>
            <Card
              title={<span><FileTextOutlined style={{marginRight: 8}} />基本信息</span>}
              style={{
                marginBottom: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 8,
                height: 400,
              }}
              bodyStyle={{padding: 16}}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 8,
                padding: 16,
                backdropFilter: 'blur(10px)',
              }}>
                <Descriptions column={1} size="small" colon={false}>
                  <Descriptions.Item label={<span style={{color: 'rgba(255,255,255,0.85)'}}><TagOutlined /> 图表名称</span>}>
                    <span style={{color: '#fff', fontWeight: 500}}>{chart.name || '-'}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label={<span style={{color: 'rgba(255,255,255,0.85)'}}><DatabaseOutlined /> 图表类型</span>}>
                    <Tag icon={getChartTypeIcon(chart.chartType || '')} color="blue">
                      {chart.chartType || '未知'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={<span style={{color: 'rgba(255,255,255,0.85)'}}><FileTextOutlined /> 分析目标</span>}>
                    <Paragraph ellipsis={{rows: 3, expandable: true, symbol: '更多'}} style={{color: '#fff', margin: 0}}>
                      {chart.goal || '-'}
                    </Paragraph>
                  </Descriptions.Item>
                  <Descriptions.Item label={<span style={{color: 'rgba(255,255,255,0.85)'}}><ClockCircleOutlined /> 创建时间</span>}>
                    <span style={{color: '#fff'}}>{chart.createTime ? dayjs(chart.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label={<span style={{color: 'rgba(255,255,255,0.85)'}}><FieldTimeOutlined /> 更新时间</span>}>
                    <span style={{color: '#fff'}}>{chart.updateTime ? dayjs(chart.updateTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </Card>

            {chart.execMessage === '失败' && chart.execMessage && (
              <Card title={<span><DeleteOutlined style={{marginRight: 8}} />失败原因</span>} style={{marginBottom: 16}}>
                <Tag color="red">{chart.execMessage || '未知错误'}</Tag>
              </Card>
            )}
          </Col>
        </Row>

        {chart.genResult && (
          <Card
            title={<span><FileTextOutlined style={{marginRight: 8}} />分析结论</span>}
            style={{
              marginTop: 16,
              marginBottom: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 8,
            }}
            headStyle={{color: '#fff', fontWeight: 'bold'}}
            bodyStyle={{color: '#fff'}}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 8,
              padding: 16,
              backdropFilter: 'blur(10px)',
            }}>
              <pre style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: 14,
                lineHeight: 1.8,
              }}>
                {chart.genResult}
              </pre>
            </div>
          </Card>
        )}

        <Divider />

        <Card title={<span><TableOutlined style={{marginRight: 8}} />数据详情</span>}>
          {chartData && Object.keys(chartData).length > 0 ? (
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 14}}>
                <thead>
                  <tr style={{backgroundColor: '#f5f5f5'}}>
                    {chartData.xAxis?.data?.map((header: string, index: number) => (
                      <th key={index} style={{padding: '12px 8px', border: '1px solid #e8e8e8', textAlign: 'center', fontWeight: 600}}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.series?.map((serie: any, sIndex: number) => (
                    serie.data?.map((value: any, vIndex: number) => (
                      sIndex === 0 && (
                        <tr key={`${sIndex}-${vIndex}`}>
                          {chartData.xAxis?.data?.map((_: any, xIndex: number) => (
                            <td key={xIndex} style={{padding: '10px 8px', border: '1px solid #e8e8e8', textAlign: 'center'}}>
                              {chartData.series[xIndex]?.data?.[vIndex] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      )
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty description="暂无数据详情" />
          )}
        </Card>
      </Card>
    </div>
  );
};

export default ChartDetailPage;