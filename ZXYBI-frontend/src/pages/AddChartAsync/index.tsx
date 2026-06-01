import { ByAiAsyncUsingPOST, getChartVOByIdUsingGET, reloadChartByAiUsingGET } from '@/services/yubi/chartController';
import { UploadOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, LoadingOutlined, BarChartOutlined, AimOutlined, FileTextOutlined, SyncOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Spin, Upload, Tag, Steps, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { history, useModel } from '@umijs/max';

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
  const [showNoCreditModal, setShowNoCreditModal] = useState(false);
  const { initialState } = useModel('@@initialState');

  const handleGoToRecharge = () => {
    setShowNoCreditModal(false);
    history.push('/recharge');
  };

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
        const data = res.data as ChartData;
        setChartData(data);
        
        if (data.status === 1 && data.genChart) {
          try {
            let option;
            if (typeof data.genChart === 'string') {
              option = JSON.parse(data.genChart);
            } else if (typeof data.genChart === 'object' && data.genChart !== null) {
              option = data.genChart;
            }
            if (option) {
              setChartOption(option);
            }
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
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    if (chartId && chartData?.status === 0) {
      const timer = setTimeout(() => {
        pollChartStatus();
      }, 2000);
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
    // 获取当前用户积分
    const userLeftCount = initialState?.currentUser?.leftCount ?? 0;
    
    // 积分校验
    if (userLeftCount <= 0) {
      setShowNoCreditModal(true);
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    
    const params = {
      ...values,
      file: undefined,
    };
    
    try {
      const res = await ByAiAsyncUsingPOST(params, {}, values.file.file.originFileObj);
      if (!res?.data) {
        message.error('提交失败');
      } else {
        message.success('分析任务提交成功，正在处理中...');
        setChartId(res.data.chartId);
        setChartData(null);
        setChartOption(null);
        form.resetFields();
      }
    } catch (e: any) {
      message.error('提交失败，' + e.message);
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

  const StatusIcon = chartData ? statusConfig[chartData.status]?.icon : ClockCircleOutlined;
  const statusColor = chartData ? statusConfig[chartData.status]?.color : 'orange';
  const statusText = chartData ? statusConfig[chartData.status]?.text : '等待中';

  const currentStep = chartId
    ? chartData?.status === 1 ? 2 : chartData?.status === -1 ? 3 : 1
    : 0;

  return (
    <div className="add-chart-async">
      <div style={{
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        borderRadius: 12,
        padding: '24px 32px',
        marginBottom: 24,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 4px 20px rgba(17, 153, 142, 0.3)'
      }}>
        <SyncOutlined spin style={{fontSize: 36}} />
        <div>
          <h2 style={{margin: 0, color: '#fff', fontSize: 20}}>异步智能分析（线程池）</h2>
          <p style={{margin: '8px 0 0 0', opacity: 0.9, fontSize: 14}}>提交任务到后台处理，无需等待即时返回结果</p>
        </div>
        <Tag color="cyan" style={{marginLeft: 'auto', fontSize: 14, padding: '4px 12px'}}>
          <SyncOutlined /> 异步模式
        </Tag>
      </div>

      <Steps current={currentStep} size="small" style={{marginBottom: 24}} items={[
        {title: '提交任务', icon: <CloudUploadOutlined />},
        {title: '处理中', icon: <LoadingOutlined spin />},
        {title: '完成', icon: <CheckCircleOutlined />}
      ]} />

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card
            title={<><AimOutlined style={{color: '#11998e', marginRight: 8}} />智能分析</>}
            style={{borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)'}}
            headStyle={{borderBottom: '1px solid #f0f0f0', fontWeight: 600}}
          >
            <Form
              form={form}
              name="addChart"
              labelAlign="left"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 19 }}
              onFinish={onFinish}
              initialValues={{}}
              hideRequiredMark
            >
              <Form.Item
                name="goal"
                label={<span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <span style={{width: 20, height: 20, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <AimOutlined style={{fontSize: 12, color: '#fff'}} />
                  </span>
                  分析目标
                </span>}
                rules={[{ required: true, message: '请输入分析目标' }]}
              >
                <TextArea 
                  placeholder="请输入你的分析需求，比如：分析网站用户的增长情况" 
                  rows={4}
                  style={{
                    borderRadius: 8,
                    borderColor: '#e8e8e8',
                    transition: 'all 0.3s ease',
                    resize: 'none'
                  }}
                />
              </Form.Item>
              <Form.Item name="name" label={<span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <span style={{width: 20, height: 20, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <FileTextOutlined style={{fontSize: 12, color: '#fff'}} />
                  </span>
                  图表名称
                </span>}>
                <Input 
                  placeholder="请输入图表名称（可选）"
                  style={{
                    borderRadius: 8,
                    borderColor: '#e8e8e8',
                    transition: 'all 0.3s ease'
                  }}
                />
              </Form.Item>
              <Form.Item name="chartType" label={<span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <span style={{width: 20, height: 20, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <BarChartOutlined style={{fontSize: 12, color: '#fff'}} />
                  </span>
                  图表类型
                </span>}>
                <Select
                  placeholder="选择图表类型（可选）"
                  style={{
                    borderRadius: 8,
                    borderColor: '#e8e8e8',
                    transition: 'all 0.3s ease'
                  }}
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
              <Form.Item name="file" label={<span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <span style={{width: 20, height: 20, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <UploadOutlined style={{fontSize: 12, color: '#fff'}} />
                  </span>
                  原始数据
                </span>}>
                <Upload name="file" maxCount={5} accept=".csv,.xlsx,.xls,.txt,.dat,.json,.ods,.parquet,.db" multiple>
                  <div style={{
                    border: '2px dashed #d9d9d9',
                    borderRadius: 8,
                    padding: '24px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    <div style={{marginBottom: 8}}>
                      <UploadOutlined style={{fontSize: 32, color: '#999'}} />
                    </div>
                    <p style={{color: '#666', margin: 0}}>点击或拖拽上传数据文件（支持多选）</p>
                    <p style={{color: '#999', fontSize: 12, margin: '8px 0 0 0'}}>支持 CSV、Excel (.xlsx/.xls)、TXT、DAT、JSON、ODS、Parquet、SQLite 格式，单次最多上传 5 个文件，单个最大 10MB</p>
                  </div>
                </Upload>
              </Form.Item>

              <Form.Item wrapperCol={{ span: 18, offset: 4 }}>
                <Space size="middle">
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting || chartId !== null} size="large"
                          style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', border: 'none'}}>
                    提交任务
                  </Button>
                  <Button htmlType="reset" size="large">重置</Button>
                  {chartId && (
                    <Button onClick={() => { setChartId(null); setChartData(null); setChartOption(null); }} size="large">
                      新建任务
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={<><SyncOutlined style={{color: '#11998e', marginRight: 8, spin: chartData?.status === 2}} />任务状态</>}
            style={{borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 16}}
            headStyle={{borderBottom: '1px solid #f0f0f0', fontWeight: 600}}
          >
            {chartId ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <StatusIcon style={{ color: statusColor, fontSize: 24 }} spin={chartData?.status === 2} />
                  <span style={{ color: statusColor, fontSize: 18, fontWeight: 'bold' }}>
                    {statusText}
                  </span>
                  <Spin spinning={polling} size="small" />
                </div>

                {chartData?.execMessage && (
                  <div style={{
                    padding: 12,
                    background: chartData.status === -1 ? '#fff2f0' : '#f6ffed',
                    borderRadius: 8,
                    marginBottom: 12
                  }}>
                    <Typography.Text type={chartData.status === -1 ? 'danger' : 'secondary'}>
                      {chartData.execMessage}
                    </Typography.Text>
                  </div>
                )}

                {chartData?.status === -1 && (
                  <Button type="primary" icon={<ReloadOutlined />} onClick={handleRetry}
                          style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', border: 'none'}}>
                    重新分析
                  </Button>
                )}
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '40px 0', color: '#999'}}>
                <SyncOutlined style={{fontSize: 48, marginBottom: 16, opacity: 0.3}} />
                <p>请在左侧提交分析任务</p>
              </div>
            )}
          </Card>

          {chartData?.status === 1 && (
            <>
              <Card
                title={<><FileTextOutlined style={{color: '#11998e', marginRight: 8}} />分析结论</>}
                style={{borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 16}}
                headStyle={{borderBottom: '1px solid #f0f0f0', fontWeight: 600}}
              >
                <div style={{lineHeight: 1.8}}>{chartData.genResult || '暂无分析结果'}</div>
              </Card>
              <Card
                title={<><BarChartOutlined style={{color: '#11998e', marginRight: 8}} />可视化图表</>}
                style={{borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)'}}
                headStyle={{borderBottom: '1px solid #f0f0f0', fontWeight: 600}}
              >
                {chartOption ? (
                  <ReactECharts option={chartOption} style={{ height: 350 }} />
                ) : (
                  <div style={{textAlign: 'center', padding: '40px 0', color: '#999'}}>
                    <p>图表加载失败</p>
                  </div>
                )}
              </Card>
            </>
          )}
        </Col>
      </Row>

      <Modal
        title="积分不足"
        visible={showNoCreditModal}
        onCancel={() => setShowNoCreditModal(false)}
        footer={null}
        closable={true}
      >
        <p>您的积分不足，无法完成此操作。</p>
        <p>请前往积分充值页面进行充值。</p>
        <Button type="primary" onClick={handleGoToRecharge} style={{ marginTop: 16 }}>
          立即充值
        </Button>
      </Modal>
    </div>
  );
};

export default AddChartAsync;