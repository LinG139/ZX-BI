import type {RequestOptions} from '@@/plugin-request/request';
import type {RequestConfig} from '@umijs/max';
import {message, notification} from 'antd';
import {history} from '@umijs/max';

enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

interface ResponseStructure {
  success: boolean;
  data: any;
  code?: number;
  message?: string;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
  errorThrower: (res) => {
    const response = res as unknown as ResponseStructure;
    const success = response.success;
    const errorCode = response.errorCode ?? response.code;
    const errorMessage = response.errorMessage ?? response.message;

    if (!success) {
      const error: any = new Error(errorMessage);
      error.name = 'BizError';
      error.info = {errorCode, errorMessage, showType: response.showType, data: response.data};
      throw error;
    }
  },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const {errorMessage, errorCode} = errorInfo;

          if (errorCode === 40101 && errorMessage?.includes('积分不足')) {
            message.warning('您的积分已用完，请充值后继续使用');
            setTimeout(() => {
              history.push('/recharge');
            }, 1500);
            return;
          }

          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // 用户未登录或会话过期时不显示错误消息
        if (error.response.status === 401) {
          console.log('用户未登录或会话已过期');
          return;
        }
        message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        message.error('None response! Please retry.');
      } else {
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      // const url = config?.url?.concat('?token = 123');
      // return { ...config, url };
      return config;
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      return response;
    },
  ],
};
