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

  const handleSubmit = async (values: API.UserRegisterRequest) => {
    const {userPassword, checkPassword, userAccount, userName} = values;

    if (userAccount.length < 4) {
      message.error('用户账号过短，至少4个字符');
      return;
    }

    if (userName && userName.length < 2) {
      message.error('昵称至少2个字符');
      return;
    }

    if (userPassword !== checkPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    try {
      const registerParams = {
        userAccount,
        userPassword,
        checkPassword,
        userName: userName || userAccount,
        userAvatar: DEFAULT_AVATAR_URL,
      };

      const res = await userRegisterUsingPOST(registerParams);
      if (res.code !== 40000) {
        const defaultLoginSuccessMessage = '注册成功！';
        message.success(defaultLoginSuccessMessage);

        if (!history) return;
        history.push({
          pathname: '/user/login',
        });
        return;
      } else {
        message.error(res.message);
      }
    } catch (error: any) {
      const defaultLoginFailureMessage = '注册失败，请重试！';
      message.error(defaultLoginFailureMessage);
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
            subTitle={<a href="https://github.com/panther125">智析云 BI 个人学习所获</a>}
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
