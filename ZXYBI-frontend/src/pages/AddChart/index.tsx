import {getChartByAiUsingPOST} from '@/services/yubi/chartController';
import {UploadOutlined, BarChartOutlined, AimOutlined, FileTextOutlined, ThunderboltOutlined} from '@ant-design/icons';
import {Button, Card, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Spin, Upload, Tag, Typography} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, {useState} from 'react';
import ReactECharts from 'echarts-for-react';
import {optimizeChartOption} from '@/utils/chartOptimizer';
import {history, useModel} from '@umijs/max';

/**
 * 添加图表页面
 * @constructor
 */
const AddChart: React.FC = () => {
  const [chart, setChart] = useState<API.BiResponse>();
  const [option, setOption] = useState<any>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showNoCreditModal, setShowNoCreditModal] = useState(false);
  const { initialState } = useModel('@@initialState');

  const handleGoToRecharge = () => {
    setShowNoCreditModal(false);
    history.push('/recharge');
  };

  /**
   * 提交
   * @param values
   */
  const onFinish = async (values: any) => {
    // 获取当前用户积分
    const userLeftCount = (initialState?.currentUser as any)?.leftCount ?? 0;
    
    // 积分校验
    if (userLeftCount <= 0) {
      setShowNoCreditModal(true);
      return;
    }

    // 避免重复提交
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setChart(undefined);
    setOption(undefined);
    // 对接后端，上传数据
    const params = {
      ...values,
      file: undefined,
    };
    try {
      const res = await getChartByAiUsingPOST(params, {}, values.file.file.originFileObj);
      if (!res?.data) {
        message.error('分析失败');
      } else {
        message.success('分析成功');
        let chartOption;
        try {
          if (typeof res.data.genChart === 'string') {
            chartOption = JSON.parse(res.data.genChart || '{}');
          } else if (typeof res.data.genChart === 'object' && res.data.genChart !== null) {
            chartOption = res.data.genChart;
          } else {
            throw new Error('图表配置格式错误');
          }
        } catch (parseError: any) {
          console.error('图表配置解析失败:', parseError);
          message.error('图表配置解析失败: ' + parseError.message);
          setSubmitting(false);
          return;
        }
        if (!chartOption) {
          throw new Error('图表代码解析错误')
        } else {
          setChart(res.data);
          setOption(chartOption);
        }
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="add-chart">
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: '24px 32px',
        marginBottom: 24,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
      }}>
        <BarChartOutlined style={{fontSize: 36}} />
        <div>
          <h2 style={{margin: 0, color: '#fff', fontSize: 20}}>同步智能分析</h2>
          <p style={{margin: '8px 0 0 0', opacity: 0.9, fontSize: 14}}>上传数据，AI 即时分析，实时生成可视化图表</p>
        </div>
        <Tag color="gold" style={{marginLeft: 'auto', fontSize: 14, padding: '4px 12px'}}>
          <ThunderboltOutlined /> 同步模式
        </Tag>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card
            title={<><AimOutlined style={{color: '#667eea', marginRight: 8}} />智能分析</>}
            style={{borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)'}}
            headStyle={{borderBottom: '1px solid #f0f0f0', fontWeight: 600}}
          >
            <Form name="addChart" labelAlign="left" labelCol={{span: 5}}
                  wrapperCol={{span: 19}} onFinish={onFinish} initialValues={{}} hideRequiredMark>
              <Form.Item
                name="goal"
                label={<span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <span style={{width: 20, height: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <AimOutlined style={{fontSize: 12, color: '#fff'}} />
                  </span>
                  分析目标
                </span>}
                rules={[{required: true, message: '请输入分析目标'}]}
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
                  <span style={{width: 20, height: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
                  <span style={{width: 20, height: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
                    {value: '折线图', label: '折线图'},
                    {value: '柱状图', label: '柱状图'},
                    {value: '堆叠图', label: '堆叠图'},
                    {value: '饼图', label: '饼图'},
                    {value: '雷达图', label: '雷达图'},
                    {value: '热力图', label: '热力图'},
                    {value: '漏斗图', label: '漏斗图'},
                    {value: '散点图', label: '散点图'},
                    {value: '仪表盘', label: '仪表盘'},
                    {value: 'K线图', label: 'K线图'},
                    {value: '长图表', label: '长图表'},
                    {value: '区域图', label: '区域图'},
                    {value: '面积热力图', label: '面积热力图'},
                    {value: '三维散点图', label: '三维散点图'},
                  ]}
                />
              </Form.Item>
              <Form.Item name="file" label={<span style={{display: 'flex', alignItems: 'center', gap: 6}}>
                  <span style={{width: 20, height: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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

              <Form.Item wrapperCol={{span: 18, offset: 4}}>
                <Space size="middle">
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting} size="large"
                          style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none'}}>
                    开始分析
                  </Button>
                  <Button htmlType="reset" size="large">重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<><FileTextOutlined style={{color: '#667eea', marginRight: 8}} />分析结论</>}
            style={{borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 16}}
            headStyle={{borderBottom: '1px solid #f0f0f0', fontWeight: 600}}
          >
            {chart?.genResult ? (
              <div style={{padding: '8px 0', lineHeight: 1.8}}>{chart.genResult}</div>
            ) : (
              <div style={{textAlign: 'center', padding: '40px 0', color: '#999'}}>
                <BarChartOutlined style={{fontSize: 48, marginBottom: 16, opacity: 0.3}} />
                <p>请先在左侧提交分析任务</p>
              </div>
            )}
            <Spin spinning={submitting} tip="正在分析中..."/>
          </Card>
          <Card
            title={<><BarChartOutlined style={{color: '#667eea', marginRight: 8}} />可视化图表</>}
            style={{borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)'}}
            headStyle={{borderBottom: '1px solid #f0f0f0', fontWeight: 600}}
          >
            {
              option ? <ReactECharts option={option} style={{height: 350}}/> : (
                <div style={{textAlign: 'center', padding: '40px 0', color: '#999'}}>
                  <BarChartOutlined style={{fontSize: 48, marginBottom: 16, opacity: 0.3}} />
                  <p>请先在左侧提交分析任务</p>
                </div>
              )
            }
            <Spin spinning={submitting}/>
          </Card>
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
export default AddChart;
