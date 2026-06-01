import { Card, Table, Tag, Space, Row, Col, Button, Modal, Descriptions, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface OperationLog {
  id: number;
  userId: number;
  userName?: string;
  operation: string;
  module: string;
  method: string;
  ip: string;
  location: string;
  status: number;
  errorMessage: string;
  params: string;
  result: string;
  createTime: string;
  duration: number;
}

interface LoginLog {
  id: number;
  userId: number;
  userName?: string;
  ip: string;
  location: string;
  device: string;
  status: number;
  createTime: string;
}

const Logs: React.FC = () => {
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('operation');
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<OperationLog | null>(null);
  const [searchParams, setSearchParams] = useState({
    searchText: '',
    status: undefined as number | undefined,
  });

  useEffect(() => {
    fetchOperationLogs();
  }, [current, pageSize]);

  useEffect(() => {
    if (activeTab === 'login') {
      fetchLoginLogs();
    }
  }, [activeTab, current, pageSize]);

  const fetchOperationLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:9001/api/admin/logs/operation/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current,
          pageSize,
          ...searchParams,
        }),
      });
      const res = await response.json();
      if (res.code === 0) {
        setOperationLogs(res.data.records || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('获取操作日志失败', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:9001/api/admin/logs/login/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current,
          pageSize,
          ...searchParams,
        }),
      });
      const res = await response.json();
      if (res.code === 0) {
        setLoginLogs(res.data.records || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('获取登录日志失败', error);
    } finally {
      setLoading(false);
    }
  };

  const showLogDetail = (log: OperationLog) => {
    setCurrentLog(log);
    setDetailVisible(true);
  };

  const handleSearch = () => {
    setCurrent(1);
    if (activeTab === 'operation') {
      fetchOperationLogs();
    } else {
      fetchLoginLogs();
    }
  };

  const handleReset = () => {
    setSearchParams({ searchText: '', status: undefined });
    setCurrent(1);
    if (activeTab === 'operation') {
      fetchOperationLogs();
    } else {
      fetchLoginLogs();
    }
  };

  const operationColumns: ColumnsType<OperationLog> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      ellipsis: true,
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (duration: number) => `${duration}ms`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => showLogDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  const loginColumns: ColumnsType<LoginLog> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      ellipsis: true,
    },
    {
      title: '设备',
      dataIndex: 'device',
      key: 'device',
      width: 200,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div>当前显示记录数: {activeTab === 'operation' ? operationLogs.length : loginLogs.length}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div>总记录数: {total}</div>
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }} wrap>
        <Button type={activeTab === 'operation' ? 'primary' : 'default'} onClick={() => { setActiveTab('operation'); setCurrent(1); }}>
          操作日志
        </Button>
        <Button type={activeTab === 'login' ? 'primary' : 'default'} onClick={() => { setActiveTab('login'); setCurrent(1); }}>
          登录日志
        </Button>
        <Input
          placeholder="搜索用户名/操作"
          value={searchParams.searchText}
          onChange={(e) => setSearchParams({ ...searchParams, searchText: e.target.value })}
          style={{ width: 200 }}
        />
        <Select
          placeholder="状态"
          value={searchParams.status}
          onChange={(value) => setSearchParams({ ...searchParams, status: value })}
          style={{ width: 120 }}
          allowClear
          options={[
            { value: 1, label: '成功' },
            { value: 0, label: '失败' },
          ]}
        />
        <Button type="primary" onClick={handleSearch}>搜索</Button>
        <Button onClick={handleReset}>重置</Button>
      </Space>

      {activeTab === 'operation' ? (
        <Table
          columns={operationColumns}
          dataSource={operationLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size || 10);
            },
          }}
        />
      ) : (
        <Table
          columns={loginColumns}
          dataSource={loginLogs}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size || 10);
            },
          }}
        />
      )}

      <Modal
        title="操作日志详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setCurrentLog(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {currentLog && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="日志ID">{currentLog.id}</Descriptions.Item>
              <Descriptions.Item label="用户">{currentLog.userName}</Descriptions.Item>
              <Descriptions.Item label="操作">{currentLog.operation}</Descriptions.Item>
              <Descriptions.Item label="模块">{currentLog.module}</Descriptions.Item>
              <Descriptions.Item label="方法">{currentLog.method}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={currentLog.status === 1 ? 'green' : 'red'}>
                  {currentLog.status === 1 ? '成功' : '失败'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="IP地址">{currentLog.ip}</Descriptions.Item>
              <Descriptions.Item label="耗时">{currentLog.duration}ms</Descriptions.Item>
              <Descriptions.Item label="位置" span={2}>{currentLog.location}</Descriptions.Item>
              <Descriptions.Item label="时间" span={2}>
                {dayjs(currentLog.createTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            {currentLog.params && (
              <div style={{ marginTop: 16 }}>
                <strong>请求参数:</strong>
                <div style={{ backgroundColor: '#f5f5f5', padding: 8, marginTop: 8, wordBreak: 'break-all' }}>
                  {currentLog.params}
                </div>
              </div>
            )}

            {currentLog.errorMessage && (
              <div style={{ marginTop: 16 }}>
                <strong>错误信息:</strong>
                <div style={{ backgroundColor: '#fff2f0', padding: 8, marginTop: 8, wordBreak: 'break-all' }}>
                  {currentLog.errorMessage}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Logs;
