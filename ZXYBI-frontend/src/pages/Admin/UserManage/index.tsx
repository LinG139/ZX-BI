import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Modal, Select, Space, Table, Tag, Popconfirm, Input, Form, App as AntApp, Row, Col, Statistic, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { UserOutlined, TeamOutlined, CheckCircleOutlined, WalletOutlined, CloseCircleOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';

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

interface Stats {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  vipCount: number;
  totalPoints: number;
}

const UserManage: React.FC = () => {
  const { message: antMessage } = AntApp.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState({
    userAccount: '',
    userName: '',
    userType: '',
  });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointsForm] = Form.useForm();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [current, pageSize]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:9001/api/admin/dashboard', {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setStats({
          totalUsers: res.data.totalUsers || 0,
          activeUsers: (res.data.totalUsers || 0) - (res.data.totalUsers || 0) * 0.1,
          adminCount: 1,
          vipCount: res.data.totalUsers ? Math.floor(res.data.totalUsers * 0.2) : 0,
          totalPoints: res.data.totalUserPoints || 0,
        });
      }
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:9001/api/admin/user/list/page', {
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
        setData(res.data.records);
        setTotal(res.data.total);
      } else {
        antMessage.error('获取数据失败: ' + res.message);
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
    setSearchParams({ userAccount: '', userName: '', userType: '' });
    setCurrent(1);
  };

  const updateUserType = async (userId: number, userType: string) => {
    try {
      const response = await fetch(`http://localhost:9001/api/admin/user/update/type?userId=${userId}&userType=${userType}`, {
        method: 'POST',
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        antMessage.success('身份更新成功');
        fetchData();
      } else {
        antMessage.error('更新失败: ' + res.message);
      }
    } catch (error) {
      antMessage.error('网络错误');
    }
  };

  const updateStatus = async (userId: number, isDelete: number) => {
    try {
      const response = await fetch(`http://localhost:9001/api/admin/user/update/status?userId=${userId}&isDelete=${isDelete}`, {
        method: 'POST',
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        antMessage.success('状态更新成功');
        fetchData();
      } else {
        antMessage.error('更新失败: ' + res.message);
      }
    } catch (error) {
      antMessage.error('网络错误');
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch('http://localhost:9001/api/admin/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: userId }),
      });
      const res = await response.json();
      if (res.code === 0) {
        antMessage.success('删除成功');
        fetchData();
      } else {
        antMessage.error('删除失败: ' + res.message);
      }
    } catch (error) {
      antMessage.error('网络错误');
    }
  };

  const handleAddUser = async (values: any) => {
    try {
      const response = await fetch('http://localhost:9001/api/user/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      const res = await response.json();
      if (res.code === 0) {
        antMessage.success('用户添加成功');
        setAddModalVisible(false);
        addForm.resetFields();
        fetchData();
        fetchStats();
      } else {
        antMessage.error('添加失败: ' + res.message);
      }
    } catch (error) {
      antMessage.error('网络错误');
    }
  };

  const openPointsModal = (user: User) => {
    setSelectedUser(user);
    pointsForm.setFieldsValue({ amount: 0, remark: '' });
    setPointsModalVisible(true);
  };

  const handleUpdatePoints = async (values: any) => {
    if (!selectedUser) return;
    try {
      const response = await fetch('http://localhost:9001/api/admin/points/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: values.amount,
          remark: values.remark,
          type: values.amount > 0 ? '充值' : '扣除',
        }),
      });
      const res = await response.json();
      if (res.code === 0) {
        antMessage.success('积分更新成功');
        setPointsModalVisible(false);
        setSelectedUser(null);
        pointsForm.resetFields();
        fetchData();
        fetchStats();
      } else {
        antMessage.error('更新失败: ' + res.message);
      }
    } catch (error) {
      antMessage.error('网络错误');
    }
  };

  const batchDelete = async () => {
    if (selectedRows.length === 0) {
      antMessage.warning('请选择要删除的用户');
      return;
    }
    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedRows.length} 个用户吗？`,
      okType: 'danger',
      onOk: async () => {
        try {
          for (const id of selectedRows) {
            await fetch('http://localhost:9001/api/admin/user/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ id }),
            });
          }
          antMessage.success('批量删除成功');
          setSelectedRows([]);
          fetchData();
          fetchStats();
        } catch (error) {
          antMessage.error('批量删除失败');
        }
      },
    });
  };

  const batchEnable = async () => {
    if (selectedRows.length === 0) {
      antMessage.warning('请选择要启用的用户');
      return;
    }
    try {
      for (const id of selectedRows) {
        await fetch(`http://localhost:9001/api/admin/user/update/status?userId=${id}&isDelete=0`, {
          method: 'POST',
          credentials: 'include',
        });
      }
      antMessage.success('批量启用成功');
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      antMessage.error('批量启用失败');
    }
  };

  const batchDisable = async () => {
    if (selectedRows.length === 0) {
      antMessage.warning('请选择要禁用的用户');
      return;
    }
    try {
      for (const id of selectedRows) {
        await fetch(`http://localhost:9001/api/admin/user/update/status?userId=${id}&isDelete=1`, {
          method: 'POST',
          credentials: 'include',
        });
      }
      antMessage.success('批量禁用成功');
      setSelectedRows([]);
      fetchData();
    } catch (error) {
      antMessage.error('批量禁用失败');
    }
  };

  const getUserType = (user: User): string => {
    if (user.userRole === 'admin') return 'admin';
    if (user.isVip === 1) return 'vip';
    return 'user';
  };

  const getUserTypeLabel = (user: User): string => {
    if (user.userRole === 'admin') return '管理员';
    if (user.isVip === 1) return 'VIP用户';
    return '普通用户';
  };

  const getUserTypeColor = (user: User): string => {
    if (user.userRole === 'admin') return 'gold';
    if (user.isVip === 1) return 'purple';
    return 'blue';
  };

  const columns: ColumnsType<User> = [
    {
      title: (
        <Checkbox
          indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
          checked={selectedRows.length === data.length && data.length > 0}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(data.map((item) => item.id));
            } else {
              setSelectedRows([]);
            }
          }}
        />
      ),
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedRows.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, record.id]);
            } else {
              setSelectedRows(selectedRows.filter((id) => id !== record.id));
            }
          }}
        />
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '账号',
      dataIndex: 'userAccount',
      width: 120,
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      width: 120,
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
      title: '身份',
      width: 100,
      render: (_, record) => (
        <Tag color={getUserTypeColor(record)}>
          {getUserTypeLabel(record)}
        </Tag>
      ),
    },
    {
      title: '积分',
      dataIndex: 'leftCount',
      width: 100,
      render: (count: number, record) => (
        <Space>
          <span>{count}</span>
          <Button
            size="small"
            type="link"
            onClick={() => openPointsModal(record)}
          >
            管理
          </Button>
        </Space>
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Select
            value={getUserType(record)}
            style={{ width: 90 }}
            size="small"
            onChange={(value) => updateUserType(record.id, value)}
            options={[
              { value: 'user', label: '普通' },
              { value: 'vip', label: 'VIP' },
              { value: 'admin', label: '管理员' },
            ]}
          />
          <Button
            type="link"
            danger={record.isDelete === 0}
            onClick={() => updateStatus(record.id, record.isDelete === 0 ? 1 : 0)}
          >
            {record.isDelete === 0 ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            title="确定删除该用户吗？"
            onConfirm={() => deleteUser(record.id)}
            okText="确定"
            cancelText="取消"
            okType="danger"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><UserOutlined style={{ color: '#1890ff' }} /> 总用户数</span>}
              value={stats?.totalUsers || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><TeamOutlined style={{ color: '#faad14' }} /> VIP用户</span>}
              value={stats?.vipCount || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><CheckCircleOutlined style={{ color: '#52c41a' }} /> 管理员</span>}
              value={stats?.adminCount || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><WalletOutlined style={{ color: '#722ed1' }} /> 总积分</span>}
              value={stats?.totalPoints || 0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {selectedRows.length > 0 && (
          <Space style={{ marginBottom: 16 }} wrap>
            <span>已选择 {selectedRows.length} 个用户</span>
            <Button onClick={batchEnable}>批量启用</Button>
            <Button onClick={batchDisable} danger>批量禁用</Button>
            <Button onClick={batchDelete} danger icon={<CloseCircleOutlined />}>批量删除</Button>
            <Button onClick={() => setSelectedRows([])}>取消选择</Button>
          </Space>
        )}

        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="账号"
            value={searchParams.userAccount}
            onChange={(e) => setSearchParams({ ...searchParams, userAccount: e.target.value })}
            style={{ width: 150 }}
            prefix={<SearchOutlined />}
          />
          <Input
            placeholder="用户名"
            value={searchParams.userName}
            onChange={(e) => setSearchParams({ ...searchParams, userName: e.target.value })}
            style={{ width: 150 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="身份"
            value={searchParams.userType || undefined}
            onChange={(value) => setSearchParams({ ...searchParams, userType: value || '' })}
            style={{ width: 120 }}
            allowClear
            options={[
              { value: 'user', label: '普通用户' },
              { value: 'vip', label: 'VIP用户' },
              { value: 'admin', label: '管理员' },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
          <Button icon={<ClockCircleOutlined />} onClick={handleReset}>重置</Button>
          <Button type="primary" onClick={() => setAddModalVisible(true)}>
            添加用户
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
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size);
              setSelectedRows([]);
            },
          }}
        />
      </Card>

      <Modal
        title="添加用户"
        open={addModalVisible}
        onOk={() => addForm.submit()}
        onCancel={() => {
          setAddModalVisible(false);
          addForm.resetFields();
        }}
        destroyOnHidden
        width={600}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddUser}
        >
          <Form.Item
            name="userAccount"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>
          <Form.Item
            name="userPassword"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            name="userName"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="userAvatar"
            label="头像"
          >
            <Input placeholder="请输入头像URL" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`积分管理 - ${selectedUser?.userName || ''}`}
        open={pointsModalVisible}
        onOk={() => pointsForm.submit()}
        onCancel={() => {
          setPointsModalVisible(false);
          setSelectedUser(null);
          pointsForm.resetFields();
        }}
        destroyOnHidden
        width={500}
      >
        <Form
          form={pointsForm}
          layout="vertical"
          onFinish={handleUpdatePoints}
        >
          <Form.Item
            name="amount"
            label="积分数量"
            rules={[{ required: true, message: '请输入积分数量' }]}
          >
            <Input
              placeholder="正数为增加，负数为扣除"
              type="number"
            />
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea placeholder="请输入备注信息" />
          </Form.Item>
          {selectedUser && (
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              <p>当前积分: <strong>{selectedUser.leftCount}</strong></p>
              <p>用户ID: {selectedUser.id}</p>
            </div>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default UserManage;