import Footer from '@/components/Footer';
import {userRegisterUsingPOST} from '@/services/yubi/userController';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {LoginForm, ProFormText} from '@ant-design/pro-components';
import {useEmotionCss} from '@ant-design/use-emotion-css';
import {Helmet, history} from '@umijs/max';
import {Avatar, message, Tabs} from 'antd';
import React, {useState} from 'react';
import Settings from '../../../../config/defaultSettings';
import {DEFAULT_AVATAR_URL} from '@/constants';

const Login: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  /**
   * 验证密码强度
   * 返回密码强度等级和提示信息
   */
  const validatePasswordStrength = (password: string): { level: number; message: string } => {
    let level = 0;
    let message = '';
    
    // 长度至少8位
    if (password.length >= 8) level++;
    // 包含数字
    if (/\d/.test(password)) level++;
    // 包含小写字母
    if (/[a-z]/.test(password)) level++;
    // 包含大写字母
    if (/[A-Z]/.test(password)) level++;
    // 包含特殊字符
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) level++;
    
    switch (level) {
      case 0:
      case 1:
        message = '密码太弱，请使用更复杂的密码';
        break;
      case 2:
        message = '密码强度较低，建议添加大写字母或特殊字符';
        break;
      case 3:
        message = '密码强度中等，可以接受';
        break;
      case 4:
      case 5:
        message = '密码强度强，安全性高';
        break;
      default:
        message = '';
    }
    
    return { level, message };
  };

  const handleSubmit = async (values: API.UserRegisterRequest) => {
    const {userPassword, checkPassword, userAccount, userName} = values;

    // 账号验证
    if (!userAccount || userAccount.trim().length < 4) {
      message.error('用户账号过短，至少4个字符');
      return;
    }

    if (userAccount.trim().length > 50) {
      message.error('用户账号过长，最多50个字符');
      return;
    }

    // 昵称验证
    if (userName && userName.trim().length < 2) {
      message.error('昵称至少2个字符');
      return;
    }

    if (userName && userName.trim().length > 50) {
      message.error('昵称过长，最多50个字符');
      return;
    }

    // 密码验证
    if (!userPassword || userPassword.length < 8) {
      message.error('密码至少8个字符');
      return;
    }

    if (userPassword.length > 100) {
      message.error('密码过长，最多100个字符');
      return;
    }

    // 密码强度验证
    const { level, message: strengthMsg } = validatePasswordStrength(userPassword);
    if (level < 2) {
      message.error(strengthMsg);
      return;
    }

    // 确认密码验证
    if (userPassword !== checkPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    try {
      const registerParams = {
        userAccount: userAccount.trim(),
        userPassword,
        checkPassword,
        userName: (userName || userAccount).trim(),
        userAvatar: DEFAULT_AVATAR_URL,
      };

      const res = await userRegisterUsingPOST(registerParams);
      if (res.code === 0) {
        message.success('注册成功！');

        if (!history) return;
        history.push({
          pathname: '/user/login',
        });
        return;
      } else {
        message.error(res.message || '注册失败');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '注册失败，请重试';
      console.error('注册失败:', error);
      message.error(errorMessage);
    }
  };

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {'注册'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '75vw',
            minWidth: 320,
          }}
        >
          <LoginForm
            submitter={{
              searchConfig: {
                submitText: '注册',
              },
            }}
            contentStyle={{
              minWidth: 280,
              maxWidth: '100%',
            }}
            logo={<img alt="logo" src="/logo.svg"/>}
            title="智析云 BI"
            subTitle={<a href="https://github.com/LinG139/ZX-BI" style={{fontSize: 18}}> 智 析 云 端 ，工 作 更 简 单 </a>}
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values) => {
              await handleSubmit(values as API.UserRegisterRequest);
            }}
          >
            <div style={{textAlign: 'center', marginBottom: 16}}>
              <Avatar
                src={DEFAULT_AVATAR_URL}
                size={80}
                style={{border: '2px solid #1890ff'}}
              />
              <div style={{marginTop: 6, color: '#999', fontSize: 12}}>
                默认头像（登录后可更换）
              </div>
            </div>

            <Tabs
              activeKey={type}
              onChange={setType}
              centered
              items={[
                {
                  key: 'account',
                  label: '账户密码注册',
                },
              ]}
            />
            {type === 'account' && (
              <>
                <ProFormText
                  name="userAccount"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined/>,
                  }}
                  placeholder={'账号（至少4个字符）'}
                  rules={[
                    {
                      required: true,
                      message: '账号是必填项！',
                    },
                  ]}
                />
                <ProFormText
                  name="userName"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined/>,
                  }}
                  placeholder={'昵称（选填，默认使用账号名）'}
                  rules={[
                    {
                      required: false,
                    },
                  ]}
                />
                <ProFormText.Password
                  name="userPassword"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined/>,
                  }}
                  placeholder={'密码'}
                  rules={[
                    {
                      required: true,
                      message: '密码是必填项！',
                    },
                  ]}
                />
                <ProFormText.Password
                  name="checkPassword"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined/>,
                  }}
                  placeholder={'重复密码'}
                  rules={[
                    {
                      required: true,
                      message: '重复密码是必填项！',
                    },
                  ]}
                />
              </>
            )}
          </LoginForm>
        </div>
      </div>
      <Footer/>
    </div>
  );
};
export default Login;
