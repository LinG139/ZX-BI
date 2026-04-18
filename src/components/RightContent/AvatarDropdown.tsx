import {LogoutOutlined, SettingOutlined, UserOutlined} from '@ant-design/icons';
import {useEmotionCss} from '@ant-design/use-emotion-css';
import {history, useModel} from '@umijs/max';
import {Avatar, Spin} from 'antd';
import {stringify} from 'querystring';
import type {MenuInfo} from 'rc-menu/lib/interface';
import React, {useCallback} from 'react';
import {flushSync} from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';
// @ts-ignore
import {userLogoutUsingPOST} from '@/services/yubi/userController';
import {DEFAULT_AVATAR_URL} from '@/constants';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const {initialState} = useModel('@@initialState');
  const {currentUser} = initialState || {};
  return <span className="anticon">{currentUser?.userName}</span>;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({menu, children}) => {
  const loginOut = async () => {
    await userLogoutUsingPOST();
    const {search, pathname} = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    const redirect = urlParams.get('redirect');
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };

  const actionClassName = useEmotionCss(({token}) => {
    return {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const {initialState, setInitialState} = useModel('@@initialState');

  const handleDownload = () => {
    const fileUrl = 'testdata/测试数据1.xlsx';
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = "测试数据1.xlsx";
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const {key} = event;
      if (key === 'logout') {
        flushSync(() => {
          setInitialState((s) => ({...s, currentUser: undefined}));
        });
        loginOut();
        return;
      }
      if (key === 'download') {
        handleDownload();
        return;
      }
      history.push(`/user/${key}`);
    },
    [setInitialState],
  );

  const loading = (
    <span className={actionClassName}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const {currentUser} = initialState;

  if (!currentUser) {
    return loading;
  }

  const avatarUrl = currentUser.userAvatar || DEFAULT_AVATAR_URL;

  const menuItems = [
    ...(menu
      ? [
        {
          key: 'download',
          icon: <SettingOutlined/>,
          label: '测试数据下载',
        },
        {
          type: 'divider' as const,
        },
      ]
      : []),
    {
      key: 'download',
      icon: <SettingOutlined/>,
      label: '测试数据下载',
    },
    {
      key: 'settings',
      icon: <SettingOutlined/>,
      label: '个人设置',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined/>,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      {children}
    </HeaderDropdown>
  );
};
