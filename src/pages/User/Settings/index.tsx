import {Button, Card, Form, Input, message, Upload, Avatar} from 'antd';
import {UploadOutlined, UserOutlined} from '@ant-design/icons';
import type {UploadProps} from 'antd';
import React, {useEffect, useState} from 'react';
import {history, useModel} from '@umijs/max';
import {getLoginUserUsingGET, updateMyUserUsingPOST} from '@/services/yubi/userController';
import {uploadFileUsingPOST} from '@/services/yubi/fileController';
import {DEFAULT_AVATAR_URL} from '@/constants';
import {flushSync} from 'react-dom';

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

const Settings: React.FC = () => {
  const [user, setUser] = useState<API.UserVO>();
  const [uploading, setUploading] = useState<boolean>(false);
  const {setInitialState} = useModel('@@initialState');

  const customUpload: UploadProps['customRequest'] = async (options: any) => {
    const {file, onSuccess, onError} = options;
    const fileObj = file as File;

    if (fileObj.size > 1024 * 1024) {
      message.error('头像文件大小不能超过1MB');
      onError?.(new Error('File too large'));
      return;
    }

    setUploading(true);

    try {
      const res = await uploadFileUsingPOST(
        {biz: 'user_avatar'},
        {},
        fileObj
      );

      if (res.code === 0 && res.data) {
        const newAvatarUrl = res.data;

        const updatedUser = {...user, userAvatar: newAvatarUrl};
        setUser(updatedUser);

        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: {
              ...s?.currentUser,
              userAvatar: newAvatarUrl,
            } as API.LoginUserVO,
          }));
        });

        message.success('头像上传成功');
        onSuccess?.(res);
      } else {
        message.error(res.message || '头像上传失败');
        onError?.(new Error(res.message));
      }
    } catch (error: any) {
      message.error('头像上传失败：' + error.message);
      onError?.(error);
    } finally {
      setUploading(false);
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
            label="账号名"
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
              <Upload
                customRequest={customUpload}
                showUploadList={false}
                accept="image/*"
                disabled={uploading}
              >
                <Button icon={<UploadOutlined/>} loading={uploading}>
                  上传头像
                </Button>
              </Upload>
              <Avatar
                src={user?.userAvatar || DEFAULT_AVATAR_URL}
                size={48}
                icon={<UserOutlined/>}
              />
            </div>
            <div style={{marginTop: '4px', color: '#999', fontSize: '12px'}}>
              支持图片格式，不超过1MB
            </div>
          </Form.Item>

          <Form.Item label="用户角色">
            <Input
              value={user?.userRole === 'admin' ? '管理员' : '普通用户'}
              disabled={true}
            />
          </Form.Item>

          <Form.Item label="剩余积分">
            <Input
              value={user?.leftCount || 0}
              disabled={true}
            />
          </Form.Item>

          <Form.Item wrapperCol={{offset: 6, span: 16}}>
            <Button type="primary" htmlType="submit" loading={uploading}>
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
    </div>
  );
};
export default Settings;
