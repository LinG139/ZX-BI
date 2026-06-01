import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Tabs, App as AntApp } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface User {
  id: number;
  userAccount: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  leftCount: number;
  isVip: number;
  createTime: string;
  updateTime: string;
  isDelete: number;
}

interface RechargeRecord {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  beforeCount: number;
  afterCount: number;
  type: string;
  remark: string;
  createTime: string;
}

const PointsManage: React.FC = () => {
  const { message: antMessage } = AntApp.useApp();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<User[]>([]);
  const [recordData, setRecordData] = useState<RechargeRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('users');
  const [userSearchParams, setUserSearchParams] = useState({
    userAccount: '',
    userName: '',
    userRole: '',
  });
  const [recordSearchParams, setRecordSearchParams] = useState({
    userName: '',
    type: '',
  });
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, [current, pageSize, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const response = await fetch('http://localhost:9001/api/admin/user/list/page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            current,
            pageSize,
            ...userSearchParams,
          }),
        });
        const res = await response.json();
        if (res.code === 0) {
          setUserData(res.data.records || []);
          setTotal(res.data.total || 0);
        } else {
          antMessage.error('获取数据失败: ' + res.message);
        }
      } else {
        const response = await fetch('http://localhost:9001/api/admin/recharge/list/page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            current,
            pageSize,
            ...recordSearchParams,
          }),
        });
        const res = await response.json();
        if (res.code === 0) {
          setRecordData(res.data.records || []);
          setTotal(res.data.total || 0);
        } else {
          antMessage.error('获取数据失败: ' + res.message);
        }
      }
    } catch (error) {
      antMessage.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrent(1);
    fetchData();
  };

  const handleReset = () => {
    if (activeTab === 'users') {
      setUserSearchParams({ userAccount: '', userName: '', userRole: '' });
    } else {
      setRecordSearchParams({ userName: '', type: '' });
    }
    setCurrent(1);
  };

  const handleUpdatePoints = async (values: any) => {
    try {
      const response = await fetch('http://localhost:9001/api/admin/points/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      const res = await response.json();
      if (res.code === 0) {
        antMessage.success('积分调整成功');
        setUpdateModalVisible(false);
        updateForm.resetFields();
        fetchData();
      } else {
        antMessage.error('操作失败: ' + res.message);
      }
    } catch (error) {
      antMessage.error('网络错误');
    }
  };

  const handleUpdatePointsFromTable = (userId: number, userName: string) => {
    updateForm.setFieldsValue({ userId, userName, type: '管理员调整' });
    setUpdateModalVisible(true);
  };

  const userColumns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
    },
    {
      title: '账号',
      dataIndex: 'userAccount',
      width: 150,
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      width: 150,
    },
    {
      title: '头像',
      dataIndex: 'userAvatar',
      width: 80,
      render: (url: string) => (
        url ? <img src={url} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} /> : '-'
      ),
    },
    {
      title: '角色',
      dataIndex: 'userRole',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: 'VIP',
      dataIndex: 'isVip',
      width: 80,
      render: (isVip: number) => (
        <Tag color={isVip === 1 ? 'purple' : 'default'}>
          {isVip === 1 ? 'VIP用户' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '当前积分',
      dataIndex: 'leftCount',
      width: 120,
      render: (count: number) => (
        <span style={{ fontWeight: 'bold', color: count > 100 ? '#52c41a' : '#faad14' }}>
          {count}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isDelete',
      width: 80,
      render: (isDelete: number) => (
        <Tag color={isDelete === 0 ? 'green' : 'red'}>
          {isDelete === 0 ? '正常' : '已禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      width: 150,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleUpdatePointsFromTable(record.id, record.userName)}
        >
          调整积分
        </Button>
      ),
    },
  ];

  const recordColumns: ColumnsType<RechargeRecord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      width: 100,
    },
    {
      title: '用户昵称',
      dataIndex: 'userName',
      width: 150,
    },
    {
      title: '变动数量',
      dataIndex: 'amount',
      width: 100,
      render: (amount: number) => (
        <Tag color={amount > 0 ? 'green' : 'red'}>
          {amount > 0 ? `+${amount}` : amount}
        </Tag>
      ),
    },
    {
      title: '变动前积分',
      dataIndex: 'beforeCount',
      width: 120,
    },
    {
      title: '变动后积分',
      dataIndex: 'afterCount',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 120,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const tabItems = [
    {
      key: 'users',
      label: '用户积分列表',
    },
    {
      key: 'records',
      label: '充值/变更记录',
    },
  ];

  return (
    <PageContainer>
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />
        
        {activeTab === 'users' && (
          <>
            <Space style={{ marginBottom: 16 }} wrap>
              <Input
                placeholder="账号"
                value={userSearchParams.userAccount}
                onChange={(e) => setUserSearchParams({ ...userSearchParams, userAccount: e.target.value })}
                style={{ width: 150 }}
              />
              <Input
                placeholder="用户名"
                value={userSearchParams.userName}
                onChange={(e) => setUserSearchParams({ ...userSearchParams, userName: e.target.value })}
                style={{ width: 150 }}
              />
              <Select
                placeholder="角色"
                value={userSearchParams.userRole || undefined}
                onChange={(value) => setUserSearchParams({ ...userSearchParams, userRole: value || '' })}
                style={{ width: 120 }}
                allowClear
                options={[
                  { value: 'user', label: '普通用户' },
                  { value: 'admin', label: '管理员' },
                ]}
              />
              <Button type="primary" onClick={handleSearch}>搜索</Button>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" onClick={() => { updateForm.resetFields(); setUpdateModalVisible(true); }}>
                调整用户积分
              </Button>
            </Space>
            <Table
              columns={userColumns}
              dataSource={userData}
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
                  setPageSize(size);
                },
              }}
            />
          </>
        )}

        {activeTab === 'records' && (
          <>
            <Space style={{ marginBottom: 16 }} wrap>
              <Input
                placeholder="用户昵称"
                value={recordSearchParams.userName}
                onChange={(e) => setRecordSearchParams({ ...recordSearchParams, userName: e.target.value })}
                style={{ width: 150 }}
              />
              <Select
                placeholder="类型"
                value={recordSearchParams.type || undefined}
                onChange={(value) => setRecordSearchParams({ ...recordSearchParams, type: value || '' })}
                style={{ width: 150 }}
                allowClear
                options={[
                  { value: '用户充值', label: '用户充值' },
                  { value: '管理员调整', label: '管理员调整' },
                ]}
              />
              <Button type="primary" onClick={handleSearch}>搜索</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
            <Table
              columns={recordColumns}
              dataSource={recordData}
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
                  setPageSize(size);
                },
              }}
            />
          </>
        )}
      </Card>

      <Modal
        title="调整用户积分"
        open={updateModalVisible}
        onOk={() => updateForm.submit()}
        onCancel={() => {
          setUpdateModalVisible(false);
          updateForm.resetFields();
        }}
        destroyOnHidden
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdatePoints}
        >
          <Form.Item
            name="userId"
            label="用户ID"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入用户ID" />
          </Form.Item>
          <Form.Item
            name="userName"
            label="用户昵称(选填)"
          >
            <Input placeholder="请输入用户昵称" disabled />
          </Form.Item>
          <Form.Item
            name="amount"
            label="变动数量"
            rules={[{ required: true, message: '请输入变动数量' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="正数增加，负数减少" />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            initialValue="管理员调整"
          >
            <Input placeholder="请输入类型" />
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PointsManage;