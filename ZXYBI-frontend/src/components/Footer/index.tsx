import { CopyrightOutlined, GithubOutlined, WarningOutlined } from '@ant-design/icons';
import { Space, Tooltip, Typography } from 'antd';
import React from 'react';

const { Text, Link } = Typography;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '24px 16px',
    background: '#fff',
    borderTop: '1px solid #f0f0f0',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#8c8c8c',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'color 0.3s',
    cursor: 'default',
  };

  const linkStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#8c8c8c',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'color 0.3s',
    textDecoration: 'none',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '14px',
  };

  const beianIconStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    verticalAlign: 'middle',
    marginRight: '4px',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = '#4096ff';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = '#8c8c8c';
  };

  return (
    <div style={footerStyle}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 第一行：版权、公安备案、ICP备案 */}
        <Space size={8} wrap style={{ justifyContent: 'center' }}>
          <Text 
            style={textStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <CopyrightOutlined style={iconStyle} />
            Copyright © {currentYear} 智析云 BI All Rights Reserved
          </Text>
          
          <span style={{ color: '#bfbfbf' }}>|</span>
          
          <Link 
            href="http://www.beian.gov.cn" 
            target="_blank" 
            rel="noopener noreferrer"
            style={linkStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src="/AIImage/R-C.png" 
              alt="公安备案图标" 
              style={beianIconStyle}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            吉公网安备22052302220601号
          </Link>
          
          <span style={{ color: '#bfbfbf' }}>|</span>
          
          <Link 
            href="https://beian.miit.gov.cn" 
            target="_blank" 
            rel="noopener noreferrer"
            style={linkStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            吉ICP备2025034696号
          </Link>
        </Space>

        {/* 第二行：项目地址、使用声明 */}
        <Space size={24} wrap style={{ justifyContent: 'center' }}>
          <Link 
            href="https://github.com/LinG139/ZX-BI" 
            target="_blank" 
            rel="noopener noreferrer"
            style={linkStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <GithubOutlined style={{ ...iconStyle, color: '#000000' }} />
            项目地址
          </Link>
          
          <Tooltip title="本项目仅供学习交流，无任何商用意图">
            <Text 
              style={textStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <WarningOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />
              本项目仅供科研学习，无任何商用意图
            </Text>
          </Tooltip>
        </Space>
      </Space>
    </div>
  );
};

export default Footer;


