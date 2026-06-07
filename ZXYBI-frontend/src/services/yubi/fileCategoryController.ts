// @ts-ignore
/* eslint-disable */
import {request} from '@umijs/max';

/** 获取所有文件分类 GET /api/fileCategory/list */
export async function listFileCategoryUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListFileCategory_>('/api/fileCategory/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 分页获取文件分类（仅管理员） POST /api/fileCategory/list/page */
export async function listFileCategoryByPageUsingPOST(
  body: API.FileCategoryQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageFileCategory_>('/api/fileCategory/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据id获取分类（仅管理员） GET /api/fileCategory/get */
export async function getFileCategoryByIdUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFileCategoryByIdUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseFileCategory_>('/api/fileCategory/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
