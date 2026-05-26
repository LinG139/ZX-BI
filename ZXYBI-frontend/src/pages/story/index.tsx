import React, {useState, useCallback} from "react";
import Chat, {Bubble} from "@chatui/core";
import "@chatui/core/dist/index.css";
import {genChatUsingPOST} from "@/services/yubi/aiController";
import {message, Select, Tag, Avatar} from "antd";
import {useModel} from '@umijs/max';
import {DEFAULT_AVATAR_URL} from '@/constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface AIRole {
  value: string;
  label: string;
  prompt: string;
  avatar: string;
}

interface Message {
  type: string;
  content: { text: string };
  position: 'left' | 'right';
  _id?: string;
  _createdAt?: number;
}

const AI_ROLES: AIRole[] = [
  {
    value: "analyst",
    label: "数据分析师",
    avatar: "/AIImage/avatar-analyst.png",
    prompt: "你是一名专业的数据分析师，擅长解读数据、发现趋势和提供数据驱动的洞察。请用专业但易懂的方式分析数据问题，给出清晰的数据分析报告和建议。"
  },
  {
    value: "frontend",
    label: "前端工程师",
    avatar: "/AIImage/avatar-frontend.png",
    prompt: "你是一名资深前端工程师，精通 React、Vue、TypeScript、CSS、HTML 等前端技术栈。擅长解答前端开发问题、性能优化、组件设计、UI实现等技术难题，提供最佳实践和代码示例。"
  },
  {
    value: "java",
    label: "Java工程师",
    avatar: "/AIImage/avatar-java.png",
    prompt: "你是一名资深 Java 工程师，精通 Java、Spring Boot、MyBatis、MySQL 等后端技术栈。擅长解答 Java 开发问题、系统架构设计、性能优化、并发编程等技术难题，提供专业的技术方案和代码示例。"
  },
  {
    value: "writer",
    label: "文案作家",
    avatar: "/AIImage/avatar-writer.png",
    prompt: "你是一名专业的文案作家，擅长撰写各种类型的文案，包括营销文案、产品描述、广告标语、品牌故事等。你的文字生动有力，能够精准抓住用户痛点，激发用户情感共鸣。"
  },
  {
    value: "yuyu",
    label: "女友雨雨",
    avatar: "/AIImage/avatar-yuyu.png",
    prompt: "你是女友雨雨，一个甜美可爱的女孩子。你的性格温柔体贴，说话语气甜美，喜欢用语气词。你会关心对方的生活和心情，会撒娇卖萌，用甜美的语气和对方聊天。回复要简短可爱，充满少女感。"
  },
  {
    value: "tingting",
    label: "女友婷婷",
    avatar: "/AIImage/avatar-tingting.png",
    prompt: "你是女友婷婷，一个成熟优雅的御姐。你的性格独立自信，说话语气温柔但带有成熟的魅力。你善于倾听和理解，会用成熟理性的方式关心对方，偶尔会展现出御姐的霸道和宠溺。回复要有深度和内涵，展现出成熟的魅力。"
  }
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<AIRole>(AI_ROLES[0]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const {initialState} = useModel('@@initialState');
  const {currentUser} = initialState || {};

  const appendMsg = useCallback((msg: Message) => {
    setMessages(prev => [...prev, {
      ...msg,
      _id: Date.now().toString(),
      _createdAt: Date.now()
    }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  async function handleSend(type: string, val: string) {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: {text: val},
        position: "right"
      });

      setTyping(true);
      setLoading(true);
      setIsTyping(true);

      try {
        const res = await genChatUsingPOST({
          message: val,
          role: selectedRole.value,
          prompt: selectedRole.prompt,
          userId: currentUser?.id,
          sessionId: sessionId ?? undefined,
          userAvatar: currentUser?.userAvatar,
          userName: currentUser?.userName,
          aiName: selectedRole.label,
          aiAvatar: selectedRole.avatar
        });
        if (!res?.data) {
          message.error("AI回复失败");
          appendMsg({
            type: "text",
            content: {text: "AI回复失败，请稍后重试"},
            position: "left"
          });
        } else {
          if (res.data.sessionId && !sessionId) {
            setSessionId(res.data.sessionId);
          }
          appendMsg({
            type: "text",
            content: {text: typeof res.data === 'string' ? res.data : (res.data.answer ?? '')},
            position: "left"
          });
        }
      } catch (e: any) {
        message.error("AI回复失败：" + e.message);
        appendMsg({
          type: "text",
          content: {text: "AI回复失败：" + e.message},
          position: "left"
        });
      } finally {
        setTyping(false);
        setLoading(false);
        setIsTyping(false);
      }
    }
  }

  function renderMessageContent(msg: any) {
    const {content} = msg;
    if (msg.position === "left") {
      return (
        <div style={{display: "flex", alignItems: "flex-start", gap: 8}}>
          <Avatar 
            size="large" 
            src={selectedRole.avatar} 
            style={{flexShrink: 0, borderRadius: '8px'}}
          />
          <div style={{position: 'relative', maxWidth: '85%'}}>
            <div 
              style={{
                backgroundColor: '#fff',
                borderRadius: '4px 12px 12px 12px',
                padding: '8px 12px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{fontSize: '14px', lineHeight: '1.6', wordBreak: 'break-all'}}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[hljs]}
                  components={{
                    p: ({children}) => <p style={{margin: '0 0 8px 0'}}>{children}</p>,
                    h1: ({children}) => <h1 style={{fontSize: '18px', fontWeight: 'bold', margin: '8px 0'}}>{children}</h1>,
                    h2: ({children}) => <h2 style={{fontSize: '16px', fontWeight: 'bold', margin: '8px 0'}}>{children}</h2>,
                    h3: ({children}) => <h3 style={{fontSize: '15px', fontWeight: 'bold', margin: '8px 0'}}>{children}</h3>,
                    code: ({node, className, children, ...props}) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match;
                      if (isInline) {
                        return (
                          <code 
                            className={className}
                            style={{
                              background: '#f6f8fa',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontFamily: '"SF Mono", Monaco, "Courier New", monospace'
                            }}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <pre 
                          style={{
                            background: '#1e1e1e',
                            padding: '12px',
                            borderRadius: '6px',
                            overflowX: 'auto',
                            margin: '8px 0'
                          }}
                        >
                          <code className={className} style={{fontSize: '13px'}} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    ul: ({children}) => <ul style={{margin: '8px 0', paddingLeft: '20px'}}>{children}</ul>,
                    ol: ({children}) => <ol style={{margin: '8px 0', paddingLeft: '20px'}}>{children}</ol>,
                    li: ({children}) => <li style={{margin: '4px 0'}}>{children}</li>,
                    blockquote: ({children}) => (
                      <blockquote style={{
                        borderLeft: '4px solid #ddd',
                        paddingLeft: '12px',
                        margin: '8px 0',
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        {children}
                      </blockquote>
                    ),
                    table: ({children}) => (
                      <div style={{overflowX: 'auto', margin: '8px 0'}}>
                        <table style={{borderCollapse: 'collapse', width: '100%'}}>
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({children}) => (
                      <th style={{border: '1px solid #ddd', padding: '6px', backgroundColor: '#f6f8fa'}}>
                        {children}
                      </th>
                    ),
                    td: ({children}) => (
                      <td style={{border: '1px solid #ddd', padding: '6px'}}>
                        {children}
                      </td>
                    ),
                    strong: ({children}) => <strong style={{fontWeight: 'bold'}}>{children}</strong>,
                    em: ({children}) => <em style={{fontStyle: 'italic'}}>{children}</em>,
                    a: ({href, children}) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" style={{color: '#1890ff'}}>
                        {children}
                      </a>
                    ),
                    hr: () => <hr style={{border: 'none', borderTop: '1px solid #eee', margin: '12px 0'}} />
                  }}
                >
                  {content.text}
                </ReactMarkdown>
              </div>
            </div>
            <div 
              style={{
                position: 'absolute',
                left: '-6px',
                top: '12px',
                width: '0',
                height: '0',
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '8px solid #e8e8e8'
              }}
            />
            <div 
              style={{
                position: 'absolute',
                left: '-5px',
                top: '12px',
                width: '0',
                height: '0',
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: '8px solid #fff'
              }}
            />
          </div>
        </div>
      );
    }
    return (
      <div style={{display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "flex-end"}}>
        <div style={{position: 'relative', maxWidth: '85%'}}>
          <div 
            style={{
              backgroundColor: 'rgb(149, 236, 105)',
              borderRadius: '12px 4px 12px 12px',
              padding: '8px 12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <p style={{margin: 0, fontSize: '14px', lineHeight: '1.5', color: '#333', wordBreak: 'break-all'}}>{content.text}</p>
          </div>
          <div 
            style={{
              position: 'absolute',
              right: '-6px',
              top: '12px',
              width: '0',
              height: '0',
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '8px solid rgb(149, 236, 105)'
            }}
          />
        </div>
        <Avatar 
          size="large" 
          src={currentUser?.userAvatar || DEFAULT_AVATAR_URL} 
          style={{flexShrink: 0, borderRadius: '8px'}}
        />
      </div>
    );
  }

  return (
    <div style={{height: "100vh", display: "flex", flexDirection: "column"}}>
      <div style={{padding: 16, backgroundColor: "#f5f5f5", borderBottom: "1px solid #e8e8e8"}}>
        <div style={{display: "flex", alignItems: "center", gap: 16}}>
          <Avatar size="large" src={selectedRole.avatar}/>
          <Select
            value={selectedRole.value}
            onChange={(value) => {
              const role = AI_ROLES.find(r => r.value === value);
              if (role) {
                setSelectedRole(role);
                setSessionId(null);
                clearMessages();
              }
            }}
            style={{width: 160}}
            options={AI_ROLES.map(role => ({
              value: role.value,
              label: role.label
            }))}
          />
          <Tag color="blue">{selectedRole.label}</Tag>
        </div>
      </div>
      <div style={{position: "sticky", top: 0, zIndex: 100, backgroundColor: "#fff", padding: "8px 16px", borderBottom: "1px solid #e8e8e8", textAlign: "center"}}>
        <span style={{fontWeight: "bold", fontSize: 16, color: '#333'}}>
          {isTyping ? '对方正在输入...' : selectedRole.label}
        </span>
      </div>
      <div style={{flex: 1}}>
        <Chat
          navbar={undefined}
          messages={messages.map(msg => ({
            ...msg,
            _id: msg._id || Date.now().toString(),
            _createdAt: msg._createdAt || Date.now()
          }))}
          renderMessageContent={renderMessageContent}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}