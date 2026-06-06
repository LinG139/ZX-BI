import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Tag, Space, Modal, message, Input, Row, Col, Statistic, Descriptions, Timeline, Typography, Divider, Avatar, Popconfirm } from 'antd';
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
  HistoryOutlined,
  GlobalOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Search } = Input;

interface AiSession {
  id: number;
  sessionName: string;
  userId: number;
  userName?: string;
  userAvatar?: string;
  role: string;
  roleName?: string;
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
  aiMessage: string;
  userAvatar?: string;
  aiAvatar?: string;
  aiName?: string;
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
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [usageStats, setUsageStats] = useState<AiUsageStats | null>(null);
  const [chatDetailVisible, setChatDetailVisible] = useState(false);
  const [currentChats, setCurrentChats] = useState<AiChat[]>([]);
  const [sessionSearchText, setSessionSearchText] = useState('');
  const [sessionCurrent, setSessionCurrent] = useState(1);
  const [pageSize] = useState(10);
  const [selectedSession, setSelectedSession] = useState<AiSession | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchUsageStats();
  }, [sessionCurrent, pageSize]);

  const fetchSessions = async () => {
    setSessionLoading(true);
    try {
      const response = await fetch('/api/admin/ai/session/list/page', {
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

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/admin/ai/stats', {
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
      const response = await fetch(`/api/admin/ai/chat/list?sessionId=${sessionId}`, {
        credentials: 'include',
      });
      const res = await response.json();
      if (res.code === 0) {
        const chats = res.data || [];
        console.log('获取到的对话记录:', chats);
        chats.forEach((chat: AiChat, index: number) => {
          console.log(`对话 ${index + 1}:`, {
            userMessage: chat.userMessage,
            aiMessage: chat.aiMessage,
            hasAIMessage: !!chat.aiMessage,
            AIMessageLength: chat.aiMessage ? chat.aiMessage.length : 0
          });
        });
        setCurrentChats(chats);
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
      const response = await fetch('/api/admin/ai/session/delete', {
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

  const deleteAllChatsInSession = async (sessionId: number) => {
    try {
      const response = await fetch('/api/admin/ai/session/delete-all-chats', {
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
      width: '12%',
      align: 'center',
      render: (text) => <Text code style={{ fontSize: '12px' }}>{text}</Text>,
    },
    {
      title: '会话名称',
      dataIndex: 'sessionName',
      key: 'sessionName',
      width: '28%',
      ellipsis: { tooltip: true },
      render: (text) => <Text strong style={{ fontSize: '13px' }}>{text || '无名称'}</Text>,
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: '18%',
      align: 'center',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Avatar size={24} src={record.userAvatar} icon={<UserOutlined />} shape="circle" />
          <span style={{ fontSize: '13px', wordBreak: 'break-all', flex: 1, textAlign: 'left' }}>
            {text || '未知用户'}
          </span>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: '12%',
      align: 'center',
      render: (text, record) => (
        <Tag color="blue" style={{ padding: '2px 8px', fontSize: '12px', borderRadius: '4px' }}>
          {record.roleName || text || '默认'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '30%',
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Button
            type="link"
            icon={<HistoryOutlined />}
            onClick={() => showSessionChats(record.id, record)}
            style={{ color: '#1677ff', fontSize: '12px', padding: '4px 8px', height: 'auto' }}
          >
            查看对话
          </Button>
          <span style={{ color: '#d9d9d9', fontSize: '12px' }}>|</span>
          <Popconfirm
            title="清空对话"
            description="确定要清空此会话的所有对话记录吗？"
            onConfirm={() => deleteAllChatsInSession(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}>
              清空
            </Button>
          </Popconfirm>
          <span style={{ color: '#d9d9d9', fontSize: '12px' }}>|</span>
          <Popconfirm
            title="删除会话"
            description="确定要删除此会话及所有对话记录吗？此操作不可恢复！"
            onConfirm={() => deleteSession(record.id)}
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}>
              删除
            </Button>
          </Popconfirm>
        </div>
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

      <Card 
        title="会话列表" 
        style={{ marginTop: 16 }} 
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search
              placeholder="搜索会话ID或标题"
              value={sessionSearchText}
              onChange={(e) => setSessionSearchText(e.target.value)}
              onSearch={fetchSessions}
              style={{ width: 220 }}
              allowClear
              size="small"
            />
            <Button icon={<ReloadOutlined />} onClick={fetchSessions} size="small">刷新</Button>
          </div>
        }
      >
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
          style={{ fontSize: '13px' }}
          components={{
            body: {
              cell: ({ children, ...restProps }) => (
                <td {...restProps} style={{ padding: '8px 12px' }}>{children}</td>
              ),
            },
            header: {
              cell: ({ children, ...restProps }) => (
                <th {...restProps} style={{ padding: '10px 12px', fontWeight: 600, fontSize: '13px' }}>{children}</th>
              ),
            },
          }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>会话详情: {selectedSession?.sessionName || '无标题'}</span>
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
                deleteAllChatsInSession(selectedSession.id);
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
            <Descriptions.Item label="用户">{selectedSession.userName || '未知用户'}</Descriptions.Item>
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
                          {chat.userName || '未知用户'}
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="AI">
                        <Space>
                          <Avatar size="small" icon={<RobotOutlined />} />
                          {chat.aiName || 'AI助手'}
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

                    {chat.aiMessage && (
                      <>
                        <Divider style={{ margin: '12px 0' }}>AI回答</Divider>
                        <Paragraph style={{ margin: 0, padding: 12, backgroundColor: '#f6ffed', borderRadius: 4 }}>
                          {chat.aiMessage}
                        </Paragraph>
                      </>
                    )}

                    <div style={{ marginTop: 12, textAlign: 'right' }}>
                      <Popconfirm
                        title="删除对话"
                        description="确定要删除这条对话记录吗？"
                        onConfirm={async () => {
                          try {
                            const response = await fetch('/api/admin/ai/chat/delete', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ id: chat.id }),
                            });
                            const res = await response.json();
                            if (res.code === 0) {
                              message.success('删除成功');
                              const updated = currentChats.filter(c => c.id !== chat.id);
                              setCurrentChats(updated);
                            } else {
                              message.error('删除失败: ' + res.message);
                            }
                          } catch (error) {
                            message.error('网络错误');
                          }
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