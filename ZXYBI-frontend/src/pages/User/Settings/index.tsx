import {Button, Card, Form, Input, message, Avatar, Modal} from 'antd';
import {UserOutlined, WalletOutlined, ArrowLeftOutlined, LockOutlined} from '@ant-design/icons';
import React, {useEffect, useState} from 'react';
import {history, useModel} from '@umijs/max';
import {getLoginUserUsingGET, updateMyUserUsingPOST, rechargeUserCountUsingPOST, updateUserPasswordUsingPOST} from '@/services/yubi/userController';
import {DEFAULT_AVATAR_URL} from '@/constants';
import {flushSync} from 'react-dom';

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

const Settings: React.FC = () => {
  const [user, setUser] = useState<API.LoginUserVO>();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const {setInitialState} = useModel('@@initialState');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setAvatarUrl(url);
    if (url) {
      const updatedUser = {...user, userAvatar: url};
      setUser(updatedUser);
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: {
            ...s?.currentUser,
            userAvatar: url,
          } as API.LoginUserVO,
        }));
      });
      message.success('头像URL已更新，点击保存修改生效');
    }
  };

  const onFinish = async (values: any) => {
    try {
      if (!user) return;

      const res = await updateMyUserUsingPOST({
        userName: user.userName,
        userAvatar: user.userAvatar,
      });

      if (res.code !== 0) {
        message.error(res.message || '更新失败');
        return;
      }

      message.success('修改成功');

      const userInfo = await getLoginUserUsingGET();
      if (userInfo && userInfo.data) {
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: userInfo.data,
          }));
        });
      }

      setTimeout(() => {
        history.push('/');
      }, 500);
    } catch (e: any) {
      message.error(e.message || '更新失败');
    }
  };

  const fetchData = async () => {
    try {
      const userInfo = await getLoginUserUsingGET();
      if (userInfo && userInfo.data) {
        setUser(userInfo.data);
        setAvatarUrl(userInfo.data.userAvatar || '');
      } else {
        message.error('获取用户信息失败');
      }
    } catch (e: any) {
      message.error('获取用户信息失败');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecharge = async () => {
    try {
      const res = await rechargeUserCountUsingPOST();
      if (res.code === 0) {
        const updatedUser = {...user, leftCount: res.data};
        setUser(updatedUser);
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: {
              ...s?.currentUser,
              leftCount: res.data,
            } as API.LoginUserVO,
          }));
        });
        message.success(`充值成功，当前积分：${res.data}`);
        setShowRechargeModal(false);
      } else {
        message.error(res.message || '充值失败');
      }
    } catch (e: any) {
      message.error('充值失败');
    }
  };

  const handleUpdatePassword = async () => {
    // 验证
    if (!oldPassword) {
      message.error('请输入旧密码');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      message.error('新密码至少8个字符');
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }

    try {
      const res = await updateUserPasswordUsingPOST({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      if (res.code === 0) {
        message.success('密码修改成功，请重新登录');
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // 可以选择自动登出
      } else {
        message.error(res.message || '密码修改失败');
      }
    } catch (e: any) {
      message.error(e.message || '密码修改失败');
    }
  };

  const resetPasswordForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(false);
  };

  return (
    <div style={{display: 'flex', justifyContent: 'center', padding: '20px'}}>
      <Card bordered={true} title={'个人设置'} style={{width: 600}}>
        <Form
          name="basic"
          labelCol={{span: 6}}
          wrapperCol={{span: 16}}
          style={{maxWidth: 600}}
          initialValues={{remember: true}}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="账号"
            required={false}
          >
            <span>{user?.userAccount}</span>
          </Form.Item>

          <Form.Item label="用户名">
            <Input
              value={user?.userName}
              placeholder="请输入用户名"
              onChange={(e) => setUser({...user, userName: e.target.value})}
            />
          </Form.Item>

          <Form.Item label="用户头像">
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <Input
                value={avatarUrl}
                placeholder="请输入头像URL地址"
                onChange={handleAvatarUrlChange}
                style={{width: '280px'}}
              />
              <Avatar
                src={user?.userAvatar || DEFAULT_AVATAR_URL}
                size={48}
                icon={<UserOutlined/>}
              />
            </div>
            <div style={{marginTop: '4px', color: '#999', fontSize: '12px'}}>
              请复制图片URL地址粘贴到上方输入框
            </div>
          </Form.Item>

          <Form.Item label="用户角色">
            <Input
              value={user?.userRole === 'admin' ? '管理员' : '普通用户'}
              disabled={true}
            />
          </Form.Item>

          <Form.Item label="剩余积分">
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <Input
                value={(user as any)?.leftCount || 0}
                disabled={true}
                style={{width: '200px'}}
              />
              <Button
                type="primary"
                icon={<WalletOutlined/>}
                onClick={() => setShowRechargeModal(true)}
              >
                充值
              </Button>
            </div>
          </Form.Item>

          <Form.Item label="修改密码">
            <Button
              type="default"
              icon={<LockOutlined/>}
              onClick={() => setShowPasswordModal(true)}
            >
              修改密码
            </Button>
          </Form.Item>

          <Form.Item wrapperCol={{offset: 6, span: 16}}>
            <Button
              icon={<ArrowLeftOutlined/>}
              onClick={() => history.push('/')}
            >
              返回
            </Button>
            <Button type="primary" htmlType="submit" style={{marginLeft: 16}}>
              保存修改
            </Button>
            <Button
              style={{marginLeft: 16}}
              onClick={() => history.push('/')}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="充值确认"
        visible={showRechargeModal}
        onOk={handleRecharge}
        onCancel={() => setShowRechargeModal(false)}
        okText="确认充值"
        cancelText="取消"
      >
        <p>确认充值后，您的积分将设置为 100。</p>
        <p style={{color: '#999', fontSize: '12px', marginTop: '8px'}}>当前积分: {(user as any)?.leftCount || 0}</p>
      </Modal>

      <Modal
        title="修改密码"
        visible={showPasswordModal}
        onOk={handleUpdatePassword}
        onCancel={resetPasswordForm}
        okText="确认修改"
        cancelText="取消"
        width={400}
      >
        <Form layout="vertical">
          <Form.Item label="旧密码">
            <Input.Password
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="请输入旧密码"
            />
          </Form.Item>
          <Form.Item label="新密码">
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码（至少8个字符）"
            />
          </Form.Item>
          <Form.Item label="确认新密码">
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default Settings;
