import { Button, Card, Form, Input, message, Avatar, Modal, Upload, Space } from 'antd';
import { UserOutlined, ArrowLeftOutlined, LockOutlined, UploadOutlined, SafetyCertificateOutlined , SettingOutlined} from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { history, useModel } from '@umijs/max';
import { getLoginUserUsingGET, updateMyUserUsingPOST, updateUserPasswordUsingPOST } from '@/services/yubi/userController';
import { uploadFileUsingPOST } from '@/services/yubi/fileController';
import { DEFAULT_AVATAR_URL } from '@/constants';
import { flushSync } from 'react-dom';
import type { UploadProps } from 'antd';

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

const Settings: React.FC = () => {
  const [user, setUser] = useState<API.LoginUserVO>();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const { setInitialState } = useModel('@@initialState');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setAvatarUrl(url);
    if (url) {
      const updatedUser = { ...user, userAvatar: url };
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
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isImage) {
        message.error('仅支持 JPG/PNG 格式!');
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 <= 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: async ({ file }) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('biz', 'user_avatar');

        const res = await uploadFileUsingPOST({ biz: 'user_avatar' }, {}, file as File);
        if (res.code === 0 && res.data) {
          const url = res.data;
          setAvatarUrl(url);
          const updatedUser = { ...user, userAvatar: url };
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
          message.success('头像上传成功!');
        } else {
          message.error(res.message || '上传失败');
        }
      } catch (error: any) {
        message.error(error.message || '上传失败');
      } finally {
        setUploading(false);
      }
    },
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

  const handleUpdatePassword = async () => {
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
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url("https://neeko-copilot.bytedance.net/api/text_to_image?prompt=futuristic%20technology%20background%20with%20holographic%20circular%20interface%20digital%20grid%20lines%20blue%20purple%20gradient%20cyberpunk%20style&image_size=landscape_16_9")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 50%, rgba(64, 196, 255, 0.3) 100%)',
      }} />
      
      <div style={{position: 'relative', zIndex: 10}}>
        <Card
          bordered={false}
          style={{  
            width: 580,
            borderRadius: 20,
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 8px 4 0px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden', 
          }}  
          bodyStyle={{padding: '36px 44px'}}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 32,
            paddingBottom: 24,
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24  
            }}>
              <SettingOutlined />
            </div>
             <div>
              <h2 style={{fontSize: 24, fontWeight: 600, color: '#1a1a1a', marginBottom: 2}}>
                个人设置  
              </h2>
              <p style={{fontSize: 14, color: '#8c8c8c'}}>
                管理您的账户信息
              </p>
            </div>  
          </div>  

          <Form
            name="basic"
            labelCol={{span: 5}}
            wrapperCol={{span: 19}}
            style={{ maxWidth: 580}} 
            initialValues={{remember: true}}
            onFinish={onFinish}  
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              label="账号"  
              required={false}
              style={{marginBottom: 24}}
            >
              <Input
                value={user?.userAccount}
                disabled
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#999',
                  borderRadius: 10,
                  cursor: 'not-allowed',
                  border: '1px solid #e9ecef'
                }}
                addonBefore={<UserOutlined style={{color: '#adb5bd'}} />}
              />
            </Form.Item>

            <Form.Item
              label="用户名"
              style={{marginBottom: 24}}
            >
              <Input
                value={user?.userName}
                placeholder="请输入用户名"
                onChange={(e) => setUser({...user, userName: e.target.value})}
                style={{borderRadius: 10}}
              />
            </Form.Item>

            <Form.Item
              label="头像"
              style={{marginBottom: 24}}
            >
              <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>  
                  <Input
                  value={avatarUrl}
                  placeholder="请输入头像URL地址"
                onChange={handleAvatarUrlChange}
                style={{flex: 1, maxWidth: 280, borderRadius: 10}}
              />
              <Upload {...uploadProps}>
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  style={{
                    borderRadius: 10,
                    height: 38,
                    padding: '0 18px'
                  }}
                > 
                  {uploading ? '上传中' : '上传图片'}
                </Button>
              </Upload>
              <Avatar
                src={user?.userAvatar || DEFAULT_AVATAR_URL}
                size={72}
                icon={<UserOutlined />}
                style={{
                  border: '4px solid #f0f0f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  flexShrink: 0
                }}
              />
            </div>
            <div style={{
              color: '#adb5bd',
              fontSize: 12, 
              textAlign: 'center'
            }}>  
              支持 JPG/PNG 格式，大小不超过 2MB
            </div>
          </div>
          </Form.Item>

            <Form.Item
              label="角色"
              style={{marginBottom: 24}}
            >
              <Input
                value={user?.userRole === 'admin' ? '管理员' : '普通用户'}
                disabled
                style={{
                  backgroundColor: '#f8f9fa',
                  color: '#999',
                  borderRadius: 10,
                  cursor: 'not-allowed',
                  border: '1px solid #e9ecef'
                }}
              />
            </Form.Item>
          
            <Form.Item
              label="密码"
              style={{marginBottom: 32}}
            >
              <Button
                icon={<LockOutlined />}
                onClick={() => setShowPasswordModal(true)}
                style={{
                  borderRadius: 10,
                  height: 44,
                  padding: '0 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderColor: '#e9ecef',
                  color: '#495057'
                }}
              >
                修改密码
              </Button>
            </Form.Item>

            <Form.Item
              style={{marginBottom: 0}}
            >
              <div style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center'
              }}> 
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => history.push('/')}
                  style={{ 
                    borderRadius: 10,
                    height: 44,
                    minWidth: 110,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', 
                    gap: 6,
                    borderColor: '#e9ecef',
                    color: '#6c757d'
                  }}
                >
                  返回首页
                </Button> 
                <Button
                  onClick={() => history.push('/')}
                  style={{
                    borderRadius: 10,
                    height: 44,
                    minWidth: 110,
                    borderColor: '#e9ecef',
                    color: '#6c757d'
                  }}  
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    borderRadius: 10,
                    height: 44, 
                    minWidth: 110,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                    fontWeight: 500
                  }}
                >
                  保存修改
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>

        <Modal
          title={
            <Space>
              <SafetyCertificateOutlined style={{color: '#667eea', fontSize: 20}} />
              <span style={{fontSize: 18, fontWeight: 600}}>修改密码</span>
            </Space>
          }
          open={showPasswordModal}
          onOk={handleUpdatePassword}
          onCancel={resetPasswordForm}
          okText="确认修改"
          cancelText="取消"
          width={440}
          bodyStyle={{padding: '24px 28px'}}
          style={{borderRadius: 16}}
        >
          <Form layout="vertical" style={{marginTop: 8}}>
            <Form.Item label="旧密码" required>
              <Input.Password
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="请输入旧密码"
                size="large"
                style={{borderRadius: 10}}
              />
            </Form.Item>
            <Form.Item label="新密码" required>
              <Input.Password
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少8个字符）"
                size="large"
                style={{borderRadius: 10}}
              />
            </Form.Item>
            <Form.Item label="确认新密码" required>
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
                size="large"
                style={{borderRadius: 10}}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};
export default Settings;
