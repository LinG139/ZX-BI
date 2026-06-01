import Footer from '@/components/Footer';
import {getLoginUserUsingGET, userLoginUsingPOST} from '@/services/yubi/userController';
import {Link} from '@@/exports';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {LoginForm, ProFormText} from '@ant-design/pro-components';
import {useEmotionCss} from '@ant-design/use-emotion-css';
import {Helmet, history, useModel} from '@umijs/max';
import {message, Tabs} from 'antd';
import React, {useState} from 'react';
import {flushSync} from 'react-dom';
import Settings from '../../../../config/defaultSettings';

const Login: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const {setInitialState} = useModel('@@initialState');
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

  const fetchUserInfo = async () => {
    const userInfo = await getLoginUserUsingGET();
    if (userInfo && userInfo.data) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo.data,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.UserLoginRequest) => {
    const {userAccount, userPassword} = values;
    
    // 表单验证
    if (!userAccount || userAccount.trim().length < 4) {
      message.error('用户名至少需要4个字符');
      return;
    }
    
    if (!userPassword || userPassword.trim().length < 8) {
      message.error('密码至少需要8个字符');
      return;
    }
    
    try {
      const res = await userLoginUsingPOST(values);
      if (res.code === 0 && res.data) {
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);

        const userInfo = res.data;
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: userInfo,
          }));
        });
        
        const urlParams = new URL(window.location.href).searchParams;
        const redirectUrl = urlParams.get('redirect');
        
        if (redirectUrl) {
          history.push(redirectUrl);
        } else {
          if (userInfo.userRole === 'admin' || userInfo.userRole === 'ADMIN') {
            history.push('/admin/dashboard');
          } else {
            history.push('/welcome');
          }
        }
        return;
      } else {
        message.error(res.message || '登录失败，请检查账号密码');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || '登录失败，请重试';
      console.error('登录失败:', error);
      message.error(errorMessage);
    }
  };
  
  const handleForgotPassword = () => {
    message.info('忘记密码功能开发中，请联系管理员重置密码');
  };
  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {'登录'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg"/>}
          title="智析云 BI"
          subTitle={<a href="https://github.com/LinG139/ZX-BI" style={{fontSize: 18}}> 智 析 云 端 ，工 作 更 简 单 </a>}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserLoginRequest);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录',
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
                placeholder={'请输入用户名:测试用户:test'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined/>,
                }}
                placeholder={'请输入密码:测试用户: 12345678'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
            </>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Link to="/user/register" style={{fontSize: 18}}>注册</Link>
            <Link 
              onClick={handleForgotPassword}
              style={{ fontSize: 14, color: '#1890ff' }} to={''}            >
              忘记密码？
            </Link>
          </div>
        </LoginForm>
      </div>
      <Footer/>
    </div>
  );
};
export default Login;
