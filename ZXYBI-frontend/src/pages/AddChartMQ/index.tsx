import { ByAiAsyncMQUsingPOST, getChartVOByIdUsingGET, reloadChartByAiUsingGET } from '@/services/yubi/chartController';
import { UploadOutlined, CheckCircleOutlined, ClockCircleOutlined, LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, Input, message, Row, Select, Space, Spin, Upload } from 'antd';
import { useForm } from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface ChartData {
  id: number;
  goal: string;
  name: string;
  chartType: string;
  genChart: string;
  genResult: string;
  status: number;
  execMessage: string;
}

const AddChartAsync: React.FC = () => {
  const [form] = useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [chartId, setChartId] = useState<number | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [polling, setPolling] = useState<boolean>(false);
  const [chartOption, setChartOption] = useState<any>(null);

  const statusConfig: Record<number, { icon: any; color: string; text: string }> = {
    0: { icon: ClockCircleOutlined, color: 'orange', text: '等待中' },
    2: { icon: LoadingOutlined, color: 'blue', text: '分析中' },
    1: { icon: CheckCircleOutlined, color: 'green', text: '分析完成' },
    [-1]: { icon: CloseCircleOutlined, color: 'red', text: '分析失败' },
  };

  const pollChartStatus = async () => {
    if (!chartId || polling) return;
    
    setPolling(true);
    try {
      const res = await getChartVOByIdUsingGET({ id: chartId });
      if (res?.data) {
        const data = res.data as unknown as ChartData;
        setChartData(data);
        
        if (data.status === 1 && data.genChart) {
          try {
            const option = JSON.parse(data.genChart);
            setChartOption(option);
          } catch (e) {
            console.error('Chart option parse error:', e);
          }
        }
        
        if (data.status !== 0 && data.status !== 2) {
          setPolling(false);
        }
      }
    } catch (e) {
      console.error('Polling error:', e);
      setPolling(false);
    }
    setPolling(false);
  };

  useEffect(() => {
    if (chartId && !chartData) {
      const timer = setTimeout(() => {
        pollChartStatus();
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    if (chartId && chartData?.status === 0) {
      const timer = setTimeout(() => {
        pollChartStatus();
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    if (chartId && chartData?.status === 2) {
      const timer = setInterval(() => {
        pollChartStatus();
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [chartId, chartData?.status]);

  const onFinish = async (values: any) => {
    if (submitting) return;
    setSubmitting(true);
    
    const params = {
      ...values,
      file: undefined,
    };
    
    try {
      const res = await ByAiAsyncMQUsingPOST(params, {}, values.file.file.originFileObj);
      if (!res?.data) {
        message.error('提交失败');
      } else {
        message.success('分析任务已加入队列，正在处理中...');
        setChartId(res.data.chartId ?? null);
        setChartData(null);
        setChartOption(null);
        form.resetFields();
      }
    } catch (e: any) {
      if (!e.message?.includes('积分不足')) {
        message.error('提交失败，' + e.message);
      }
    }
    setSubmitting(false);
  };

  const handleRetry = async () => {
    if (!chartId) return;
    
    try {
      const res = await reloadChartByAiUsingGET({ chartId });
      if (res?.data) {
        message.success('重试请求已提交');
        setChartData({ ...chartData!, status: 0, execMessage: '等待中' });
        setChartOption(null);
      }
    } catch (e: any) {
      message.error('重试失败，' + e.message);
    }
  };

  const StatusIcon = chartData ? statusConfig[chartData.status as keyof typeof statusConfig]?.icon : ClockCircleOutlined;
  const statusColor = chartData ? statusConfig[chartData.status]?.color : 'orange';
  const statusText = chartData ? statusConfig[chartData.status]?.text : '等待中';

  return (
    <div className="add-chart-mq">
      <Row gutter={24}>
        <Col span={12}>
          <Card title="智能分析（MQ异步）">
            <Form
              form={form}
              name="addChart"
              labelAlign="left"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              onFinish={onFinish}
              initialValues={{}}
            >
              <Form.Item
                name="goal"
                label="分析目标"
                rules={[{ required: true, message: '请输入分析目标' }]}
              >
                <TextArea placeholder="请输入你的分析需求，比如：分析网站用户的增长情况" />
              </Form.Item>
              <Form.Item name="name" label="图表名称">
                <Input placeholder="请输入图表名称" />
              </Form.Item>
              <Form.Item name="chartType" label="图表类型">
                <Select
                  options={[
                    { value: '折线图', label: '折线图' },
                    { value: '柱状图', label: '柱状图' },
                    { value: '堆叠图', label: '堆叠图' },
                    { value: '饼图', label: '饼图' },
                    { value: '雷达图', label: '雷达图' },
                    { value: '热力图', label: '热力图' },
                    { value: '漏斗图', label: '漏斗图' },
                    { value: '散点图', label: '散点图' },
                    { value: '仪表盘', label: '仪表盘' },
                    { value: 'K线图', label: 'K线图' },
                    { value: '长图表', label: '长图表' },
                    { value: '区域图', label: '区域图' },
                    { value: '面积热力图', label: '面积热力图' },
                    { value: '三维散点图', label: '三维散点图' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="file" label="原始数据">
                <Upload name="file" maxCount={1}>
                  <Button icon={<UploadOutlined />}>上传 CSV 文件</Button>
                </Upload>
              </Form.Item>

              <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting || chartId !== null}>
                    提交到队列
                  </Button>
                  <Button htmlType="reset">重置</Button>
                  {chartId && (
                    <Button onClick={() => { setChartId(null); setChartData(null); setChartOption(null); }}>
                      新建任务
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="任务状态">
            {chartId ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <StatusIcon style={{ color: statusColor, fontSize: 20 }} spin={chartData?.status === 2} />
                  <span style={{ color: statusColor, fontSize: 16, fontWeight: 'bold' }}>
                    {statusText}
                  </span>
                  <Spin spinning={polling} size="small" />
                </div>
                
                {chartData?.execMessage && (
                  <p style={{ color: chartData.status === -1 ? '#ff4d4f' : '#666' }}>
                    {chartData.execMessage}
                  </p>
                )}
                
                {chartData?.status === -1 && (
                  <Button type="primary" icon={<ReloadOutlined />} onClick={handleRetry}>
                    重新分析
                  </Button>
                )}
              </div>
            ) : (
              <div>请在左侧提交分析任务</div>
            )}
          </Card>
          
          {chartData?.status === 1 && (
            <>
              <Divider />
              <Card title="分析结论">
                {chartData.genResult || '暂无分析结果'}
              </Card>
              <Divider />
              <Card title="可视化图表">
                {chartOption ? (
                  <ReactECharts option={chartOption} style={{ height: '400px' }} />
                ) : (
                  <div>图表加载失败</div>
                )}
              </Card>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AddChartAsync;