import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Tag, Space, Modal, message, Input, Select, Row, Col, Statistic, Descriptions, Timeline, Typography, Divider, Avatar, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  MessageOutlined,
  RobotOutlined,
  UserOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  GlobalOutlined,
  TeamOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface AiSession {
  id: number;
  sessionName: string;
  userId: number;
  userName?: string;
  role: string;
  prompt: string;
  createTime: string;
  updateTime: string;
}

interface AiChat {
  id: number;
  sessionId: number;
  userId: number;
  userName?: string;
  userMessage: string;
  AIMessage: string;
  userAvatar?: string;
  AIAvatar?: string;
  AIName?: string;
  createTime: string;
}

interface AiUsageStats {
  totalSessions: number;
  totalChats: number;
  todayChats: number;
  weekChats: number;
  monthChats: number;
}

const AiManage: React.FC = () => {
  const [sessionLoading, setSessionLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [chats, setChats] = useState<AiChat[]>([]);
  const [usageStats, setUsageStats] = useState<AiUsageStats | null>(null);
  const [chatDetailVisible, setChatDetailVisible] = useState(false);
  const [currentChats, setCurrentChats] = useState<AiChat[]>([]);
  const [sessionSearchText, setSessionSearchText] = useState('');
  const [sessionCurrent, setSessionCurrent] = useState(1);
  const [chatCurrent, setChatCurrent] = useState(1);
  const [pageSize] = useState(10);
  const [selectedSession, setSelectedSession] = useState<AiSession | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchUsageStats();
  }, [sessionCurrent, pageSize]);

  useEffect(() => {
    fetchChats();
  }, [chatCurrent, pageSize]);

  const fetchSessions = async () => {
    setSessionLoading(true);
    try {
      const response = await fetch('http://localhost:9001/api/admin/ai/session/list/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current: sessionCurrent,
          pageSize,
          searchText: sessionSearchText || undefined,
        }),
      });
      const res = await response.json();
      if (res.code === 0) {
        setSessions(res.data.records || []);
      } else {
        message.error('获取会话列表失败: ' + res.message);
      }
    } catch (error) {
      message.error('网络错误');
    } finally {
      setSessionLoading(false);
    }
  };

  const fetchChats = async () => {
    setChatLoading(true);
    try {
      const response = await fetch('http://localhost:9001/api/admin/ai/chat/list/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current: chatCurrent,
          pageSize,
        }),
      });
      const res = await response.json();
      if (res.code === 0) {
        setChats(res.data.records || []);
      } else {
        message.error('获取对话列表失败: ' + res.message);
      }
    } catch (error) {
      message.error('网络错误');
    } finally {
      setChatLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('http://localhost:9001/api/admin/ai/stats', {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setUsageStats(res.data);
      }
    } catch (error) {
      message.error('获取统计失败');
    }
  };

  const showSessionChats = async (sessionId: number, session: AiSession) => {
    try {
      const response = await fetch(`http://localhost:9001/api/admin/ai/chat/list?sessionId=${sessionId}`, {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        setCurrentChats(res.data || []);
        setSelectedSession(session);
        setChatDetailVisible(true);
      } else {
        message.error('获取对话详情失败');
      }
    } catch (error) {
      message.error('网络错误');
    }
  };

  const deleteSession = async (sessionId: number) => {
    try {
      const response = await fetch('http://localhost:9001/api/admin/ai/session/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: sessionId }),
      });
      const res = await response.json();
      if (res.code === 0) {
        message.success('会话删除成功（包含所有对话记录）');
        fetchSessions();
        fetchUsageStats();
      } else {
        message.error('删除失败: ' + res.message);
      }
    } catch (error) {
      message.error('网络错误');
    }
  };

  const deleteChat = async (chatId: number) => {
    try {
      const response = await fetch('http://localhost:9001/api/admin/ai/chat/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: chatId }),
      });
      const res = await response.json();
      if (res.code === 0) {
        message.success('对话记录删除成功');
        fetchChats();
        fetchUsageStats();
      } else {
        message.error('删除失败: ' + res.message);
      }
    } catch (error) {
      message.error('网络错误');
    }
  };

  const deleteAllChatsInSession = async (sessionId: number) => {
    try {
      const response = await fetch('http://localhost:9001/api/admin/ai/session/delete-all-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: sessionId }),
      });
      const res = await response.json();
      if (res.code === 0) {
        message.success('会话内所有对话记录已清空');
        fetchSessions();
        fetchChats();
      } else {
        message.error('删除失败: ' + res.message);
      }
    } catch (error) {
      message.error('网络错误');
    }
  };

  const sessionColumns: ColumnsType<AiSession> = [
    {
      title: '会话ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '会话名称',
      dataIndex: 'sessionName',
      key: 'sessionName',
      ellipsis: true,
      render: (text) => <Text strong>{text || '无名称'}</Text>,
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      render: (text, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{text || `用户${record.userId}`}</Text>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (text) => <Tag color="blue">{text || '默认'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<HistoryOutlined />}
            onClick={() => showSessionChats(record.id, record)}
          >
            查看对话
          </Button>
          <Popconfirm
            title="清空对话"
            description="确定要清空此会话的所有对话记录吗？"
            onConfirm={() => deleteAllChatsInSession(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              清空
            </Button>
          </Popconfirm>
          <Popconfirm
            title="删除会话"
            description="确定要删除此会话及所有对话记录吗？此操作不可恢复！"
            onConfirm={() => deleteSession(record.id)}
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const chatColumns: ColumnsType<AiChat> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '会话ID',
      dataIndex: 'sessionId',
      key: 'sessionId',
      width: 80,
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      render: (text, record) => <Text>{text || `用户${record.userId}`}</Text>,
    },
    {
      title: '用户消息',
      dataIndex: 'userMessage',
      key: 'userMessage',
      ellipsis: true,
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'AI消息',
      dataIndex: 'AIMessage',
      key: 'AIMessage',
      ellipsis: true,
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="删除对话"
          description="确定要删除这条对话记录吗？"
          onConfirm={() => deleteChat(record.id)}
          okText="确认"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><TeamOutlined style={{ color: '#1890ff' }} /> 总会话数</span>}
              value={usageStats?.totalSessions || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><MessageOutlined style={{ color: '#52c41a' }} /> 总对话数</span>}
              value={usageStats?.totalChats || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><ThunderboltOutlined style={{ color: '#faad14' }} /> 今日对话</span>}
              value={usageStats?.todayChats || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" hoverable>
            <Statistic
              title={<span><GlobalOutlined style={{ color: '#722ed1' }} /> 本周对话</span>}
              value={usageStats?.weekChats || 0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="会话列表" style={{ marginTop: 16 }} extra={
        <Space>
          <Search
            placeholder="搜索会话ID或标题"
            value={sessionSearchText}
            onChange={(e) => setSessionSearchText(e.target.value)}
            onSearch={fetchSessions}
            style={{ width: 250 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={fetchSessions}>刷新</Button>
        </Space>
      }>
        <Table
          columns={sessionColumns}
          dataSource={sessions}
          rowKey="id"
          loading={sessionLoading}
          pagination={{
            current: sessionCurrent,
            pageSize,
            total: sessions.length,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => setSessionCurrent(page),
          }}
        />
      </Card>

      <Card title="对话记录" style={{ marginTop: 16 }} extra={
        <Button icon={<ReloadOutlined />} onClick={fetchChats}>刷新</Button>
      }>
        <Table
          columns={chatColumns}
          dataSource={chats}
          rowKey="id"
          loading={chatLoading}
          pagination={{
            current: chatCurrent,
            pageSize,
            total: chats.length,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => setChatCurrent(page),
          }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>会话详情: {selectedSession?.title || '无标题'}</span>
          </Space>
        }
        open={chatDetailVisible}
        onCancel={() => {
          setChatDetailVisible(false);
          setCurrentChats([]);
          setSelectedSession(null);
        }}
        footer={[
          <Button key="close" onClick={() => setChatDetailVisible(false)}>
            关闭
          </Button>,
          <Popconfirm
            key="delete"
            title="清空对话"
            description="确定要清空此会话的所有对话记录吗？"
            onConfirm={() => {
              if (selectedSession) {
                deleteAllChatsInSession(selectedSession.sessionId);
                setChatDetailVisible(false);
              }
            }}
            okText="确认"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              清空会话
            </Button>
          </Popconfirm>,
        ]}
        width={900}
      >
        {selectedSession && (
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="会话ID">
              <Text code copyable>{selectedSession.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="会话名称">{selectedSession.sessionName || '无名称'}</Descriptions.Item>
            <Descriptions.Item label="用户">{selectedSession.userName || `用户${selectedSession.userId}`}</Descriptions.Item>
            <Descriptions.Item label="角色">{selectedSession.role || '默认'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedSession.createTime}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{selectedSession.updateTime}</Descriptions.Item>
          </Descriptions>
        )}

        <Divider orientation="left">对话记录</Divider>
        <div style={{ maxHeight: 500, overflowY: 'auto', padding: '0 16px' }}>
          {currentChats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <MessageOutlined style={{ fontSize: 32 }} />
              <div style={{ marginTop: 8 }}>暂无对话记录</div>
            </div>
          ) : (
            <Timeline mode="left" style={{ marginTop: 16 }}>
              {currentChats.map((chat, index) => (
                <Timeline.Item
                  key={chat.id}
                  dot={
                    <Avatar size="small" icon={<RobotOutlined />} style={{ backgroundColor: '#722ed1' }} />
                  }
                  color="green"
                >
                  <Card size="small" style={{ marginBottom: 8, width: '100%' }}>
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="用户">
                        <Space>
                          <Avatar size="small" icon={<UserOutlined />} />
                          {chat.userName || `用户${chat.userId}`}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="AI">
                        <Space>
                          <Avatar size="small" icon={<RobotOutlined />} />
                          {chat.AIName || 'AI助手'}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="会话ID">{chat.sessionId}</Descriptions.Item>
                      <Descriptions.Item label="时间">
                        {chat.createTime}
                      </Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ margin: '12px 0' }}>用户消息</Divider>
                    <Paragraph style={{ margin: 0, padding: 12, backgroundColor: '#f0f5ff', borderRadius: 4 }}>
                      {chat.userMessage}
                    </Paragraph>

                    {chat.AIMessage && (
                      <>
                        <Divider style={{ margin: '12px 0' }}>AI回答</Divider>
                        <Paragraph style={{ margin: 0, padding: 12, backgroundColor: '#f6ffed', borderRadius: 4 }}>
                          {chat.AIMessage}
                        </Paragraph>
                      </>
                    )}

                    <div style={{ marginTop: 12, textAlign: 'right' }}>
                      <Popconfirm
                        title="删除对话"
                        description="确定要删除这条对话记录吗？"
                        onConfirm={() => {
                          deleteChat(chat.id);
                          const updated = currentChats.filter(c => c.id !== chat.id);
                          setCurrentChats(updated);
                        }}
                        okText="确认"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>
                    </div>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
};

export default AiManage;