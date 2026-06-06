import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Modal, Select, Space, Table, Tag, Popconfirm, Input, Form, App as AntApp, message, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ReloadOutlined, KeyOutlined, LockOutlined, MessageOutlined, CopyOutlined } from '@ant-design/icons';

interface AiConfig {
  id: number;
  platformType: string;
  platformName: string;
  apiKey: string;
  secret?: string;
  baseUrl?: string;
  chatModelId: string;
  chartModelId: string;
  isActive: number;
  timeout?: number;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

interface PlatformOption {
  value: string;
  label: string;
  defaultUrl: string;
}

const AiConfigPage: React.FC = () => {
  const { message: antMessage } = AntApp.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AiConfig[]>([]);
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [currentConfig, setCurrentConfig] = useState<AiConfig | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPlatforms();
    fetchConfigs();
    fetchCurrentConfig();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/admin/ai-config/platforms', {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setPlatforms(res.data);
      } else if (res.code === 40100) {
        console.warn('用户未登录，无法获取平台列表');
      } else {
        antMessage.error('获取平台列表失败: ' + res.message);
      }
    } catch (error) {
      console.error('获取平台列表失败', error);
    }
  };

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/ai-config/list', {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setData(res.data);
      } else if (res.code === 40100) {
        console.warn('用户未登录，无法获取配置列表');
      } else {
        antMessage.error('获取配置列表失败: ' + res.message);
      }
    } catch (error) {
      console.error('获取配置列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentConfig = async () => {
    try {
      const response = await fetch('/api/admin/ai-config/active', {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setCurrentConfig(res.data);
      }
    } catch (error) {
      console.error('获取当前配置失败', error);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setSelectedPlatform('');
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: AiConfig) => {
    setEditMode(true);
    setSelectedPlatform(record.platformType);
    form.setFieldsValue({
      id: record.id,
      platformType: record.platformType,
      platformName: record.platformName,
      apiKey: record.apiKey,
      secret: record.secret,
      baseUrl: record.baseUrl,
      chatModelId: record.chatModelId,
      chartModelId: record.chartModelId,
      timeout: record.timeout,
      temperature: record.temperature,
      topP: record.topP,
      maxTokens: record.maxTokens,
      remark: record.remark,
      isActive: record.isActive === 1,
    });
    setModalVisible(true);
  };

  const handleSave = async (values: any) => {
    try {
      let url = '';
      let method = '';
      
      if (editMode) {
        url = `/api/admin/ai-config/${values.id}`;
        method = 'PUT';
      } else {
        url = '/api/admin/ai-config/add';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      const res = await response.json();
      if (res.code === 0) {
        antMessage.success(editMode ? '修改成功' : '添加成功');
        setModalVisible(false);
        form.resetFields();
        fetchConfigs();
        fetchCurrentConfig();
      } else {
        antMessage.error('操作失败: ' + res.message);
      }
    } catch (error) {
      antMessage.error('网络错误');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/ai-config/${id}/activate`, {
        method: 'POST',
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        antMessage.success('启用成功');
        fetchConfigs();
        fetchCurrentConfig();
      } else {
        antMessage.error('启用失败: ' + res.message);
      }
    } catch (error) {
      antMessage.error('网络错误');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/ai-config/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        antMessage.success('删除成功');
        fetchConfigs();
        fetchCurrentConfig();
      } else {
        antMessage.error('删除失败: ' + res.message);
      }
    } catch (error) {
      antMessage.error('网络错误');
    }
  };

  const handleRefresh = () => {
    fetchConfigs();
    fetchCurrentConfig();
  };

  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; response?: string; error?: string }>({});
  const [testLoading, setTestLoading] = useState(false);
  const [testingId, setTestingId] = useState<number>(0);

  const handleTest = async (id: number) => {
    setTestingId(id);
    setTestLoading(true);
    setTestModalVisible(true);
    try {
      const response = await fetch(`/api/admin/ai-config/test/${id}`, {
        method: 'POST',
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setTestResult(res.data);
      } else {
        setTestResult({ success: false, message: '测试失败: ' + res.message });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: '网络错误', error: error.message });
    } finally {
      setTestLoading(false);
    }
  };

  const handlePlatformChange = (value: string) => {
    setSelectedPlatform(value);
    const platform = platforms.find(p => p.value === value);
    // 自动填入平台默认URL
    if (platform?.defaultUrl) {
      form.setFieldsValue({ baseUrl: platform.defaultUrl });
    }
  };

  const getPlatformName = (platformType: string): string => {
    const platform = platforms.find(p => p.value === platformType);
    return platform?.label || platformType;
  };

  const getPlatformColor = (platformType: string): string => {
    const colorMap: { [key: string]: string } = {
      'zhipu': 'blue',
      'qwen': 'orange',
      'wenxin': 'red',
      'deepseek': 'purple',
      'gemini': 'green',
      'claude': 'cyan',
      'openai': 'gray',
    };
    return colorMap[platformType] || 'default';
  };

  const truncateApiKey = (apiKey: string): string => {
    if (!apiKey || apiKey.length <= 20) return apiKey;
    return apiKey.substring(0, 8) + '***' + apiKey.substring(apiKey.length - 8);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      antMessage.success('已复制到剪贴板');
    } catch (error) {
      antMessage.error('复制失败');
    }
  };

  const columns: ColumnsType<AiConfig> = [
    {
      title: '平台',
      dataIndex: 'platformType',
      key: 'platformType',
      width: '10%',
      align: 'center',
      render: (type: string) => (
        <Tag 
          color={getPlatformColor(type)} 
          style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}
        >
          {getPlatformName(type)}
        </Tag>
      ),
    },
    {
      title: '平台名称',
      dataIndex: 'platformName',
      key: 'platformName',
      width: '12%',
      ellipsis: { tooltip: true },
    },
    {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      width: '15%',
      render: (apiKey: string) => (
        <Tooltip title={apiKey} placement="top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
               onClick={() => copyToClipboard(apiKey)}>
            <span style={{ fontSize: '12px', color: '#666' }}>{truncateApiKey(apiKey)}</span>
            <CopyOutlined style={{ fontSize: '12px', color: '#999' }} />
          </div>
        </Tooltip>
      ),
    },
    {
      title: '聊天模型',
      dataIndex: 'chatModelId',
      key: 'chatModelId',
      width: '15%',
      ellipsis: { tooltip: true },
      render: (text: string) => <span style={{ fontSize: '13px' }}>{text}</span>,
    },
    {
      title: '图表模型',
      dataIndex: 'chartModelId',
      key: 'chartModelId',
      width: '15%',
      ellipsis: { tooltip: true },
      render: (text: string) => <span style={{ fontSize: '13px' }}>{text}</span>,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '8%',
      align: 'center',
      render: (isActive: number) => (
        <Tag 
          color={isActive === 1 ? 'green' : 'default'} 
          style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}
        >
          {isActive === 1 ? '使用中' : '未启用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: '15%',
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
          <Button
            type="primary"
            size="small"
            disabled={record.isActive === 1}
            onClick={() => handleActivate(record.id)}
            icon={<CheckCircleOutlined />}
            style={{ padding: '4px 10px', fontSize: '12px', height: 'auto' }}
          >
            启用
          </Button>
          <Button
            size="small"
            onClick={() => handleEdit(record)}
            icon={<EditOutlined />}
            style={{ padding: '4px 10px', fontSize: '12px', height: 'auto' }}
          >
            编辑
          </Button>
          <Button
            size="small"
            onClick={() => handleTest(record.id)}
            icon={<MessageOutlined />}
            style={{ padding: '4px 8px', fontSize: '12px', height: 'auto', width: 'auto' }}
          />
          <Popconfirm
            title="确定删除该配置吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />} style={{ padding: '4px 8px', fontSize: '12px', height: 'auto', width: 'auto' }} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title={
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#1f1f1f' }}>
          AI配置管理
        </div>
      }
      extra={[
        <Button
          key="refresh"
          onClick={handleRefresh}
          icon={<ReloadOutlined />}
          size="small"
          style={{ marginRight: '8px', padding: '4px 12px' }}
        >
          刷新
        </Button>,
        <Button
          key="add"
          type="primary"
          onClick={handleAdd}
          icon={<PlusOutlined />}
          size="small"
          style={{ padding: '4px 16px' }}
        >
          添加配置
        </Button>,
      ]}
    >
      {currentConfig && (
        <Card
          style={{ 
            marginBottom: '16px', 
            borderRadius: '8px',
            border: '1px solid #e8f5e9',
            backgroundColor: '#fafafa'
          }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#2e7d32' }}>
              <CheckCircleOutlined style={{ fontSize: '18px' }} />
              <span>当前使用的配置</span>
            </div>
          }
          headStyle={{ 
            backgroundColor: '#e8f5e9',
            borderBottom: '1px solid #c8e6c9',
            borderRadius: '8px 8px 0 0'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>平台：</span>
              <Tag color="green" style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                {getPlatformName(currentConfig.platformType)}
              </Tag>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>聊天模型：</span>
              <span style={{ fontSize: '13px', color: '#333' }}>{currentConfig.chatModelId}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>图表模型：</span>
              <span style={{ fontSize: '13px', color: '#333' }}>{currentConfig.chartModelId}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                 onClick={() => copyToClipboard(currentConfig.apiKey)}>
              <span style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>API Key：</span>
              <span style={{ fontSize: '12px', color: '#999', textDecoration: 'underline' }}>
                {truncateApiKey(currentConfig.apiKey)}
              </span>
              <CopyOutlined style={{ fontSize: '12px', color: '#999' }} />
            </div>
          </div>
        </Card>
      )}

      <Card style={{ borderRadius: '8px', border: '1px solid #e8e8e8' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
          bordered={false}
          style={{ fontSize: '13px' }}
          components={{
            body: {
              cell: ({ children, ...restProps }) => (
                <td {...restProps} style={{ padding: '10px 12px' }}>{children}</td>
              ),
            },
            header: {
              cell: ({ children, ...restProps }) => (
                <th {...restProps} style={{ padding: '10px 12px', fontWeight: 600, fontSize: '13px', backgroundColor: '#fafafa' }}>{children}</th>
              ),
            },
          }}
          rowStyle={{ height: '52px' }}
        />
      </Card>

      <Modal
        title={editMode ? '编辑AI配置' : '添加AI配置'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedPlatform('');
        }}
        width={700}
        style={{ borderRadius: '8px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="platformType"
            label="AI平台"
            rules={[{ required: true, message: '请选择AI平台' }]}
          >
            <Select
              placeholder="请选择AI平台"
              options={platforms.map(p => ({ value: p.value, label: p.label }))}
              onChange={handlePlatformChange}
              disabled={editMode}
            />
          </Form.Item>

          <Form.Item
            name="platformName"
            label="平台名称"
            rules={[{ required: true, message: '请输入平台名称' }]}
          >
            <Input placeholder="请输入平台名称" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="apiKey"
              label="API Key"
              rules={[{ required: true, message: '请输入API Key' }]}
            >
              <Input.Password placeholder="请输入API Key" prefix={<KeyOutlined />} />
            </Form.Item>

            <Form.Item
              name="secret"
              label="Secret（选填）"
            >
              <Input.Password placeholder="部分平台需要" prefix={<LockOutlined />} />
            </Form.Item>
          </div>

          <Form.Item
            name="baseUrl"
            label="API地址"
          >
            <Input placeholder="留空将使用平台默认地址" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="chatModelId"
              label="聊天模型ID"
              rules={[{ required: true, message: '请输入聊天模型ID' }]}
            >
              <Input placeholder="请输入聊天模型ID，如 glm-4、deepseek-chat" />
            </Form.Item>

            <Form.Item
              name="chartModelId"
              label="图表模型ID"
              rules={[{ required: true, message: '请输入图表模型ID' }]}
            >
              <Input placeholder="请输入图表模型ID，如 glm-4、deepseek-chat" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="timeout"
              label="超时时间(ms)"
              initialValue={30000}
            >
              <Input type="number" placeholder="默认30000" />
            </Form.Item>

            <Form.Item
              name="temperature"
              label="温度"
              initialValue={0.7}
            >
              <Input type="number" step={0.01} placeholder="默认0.7" />
            </Form.Item>

            <Form.Item
              name="maxTokens"
              label="最大Token数"
              initialValue={4096}
            >
              <Input type="number" placeholder="默认4096" />
            </Form.Item>
          </div>

          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="AI配置测试结果"
        open={testModalVisible}
        onCancel={() => {
          setTestModalVisible(false);
          setTestResult({});
        }}
        footer={null}
        width={600}
      >
        <div style={{ padding: '16px' }}>
          {testLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading" style={{ marginBottom: '16px' }}>测试中...</div>
              <p>正在测试AI配置，请稍候...</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                {testResult.success ? (
                  <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: '12px' }} />
                ) : (
                  <DeleteOutlined style={{ fontSize: '24px', color: '#ff4d4f', marginRight: '12px' }} />
                )}
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {testResult.success ? '测试成功' : '测试失败'}
                </span>
              </div>
              <p style={{ marginBottom: '16px', color: '#666' }}>{testResult.message}</p>
              {testResult.response && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>AI响应：</p>
                  <pre style={{ backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
                    {testResult.response}
                  </pre>
                </div>
              )}
              {testResult.error && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ff4d4f' }}>错误信息：</p>
                  <pre style={{ backgroundColor: '#fff2f0', padding: '12px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto', color: '#ff4d4f' }}>
                    {testResult.error}
                  </pre>
                </div>
              )}
              <Button
                type="primary"
                onClick={() => {
                  setTestModalVisible(false);
                  setTestResult({});
                }}
              >
                确定
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
};

export default AiConfigPage;