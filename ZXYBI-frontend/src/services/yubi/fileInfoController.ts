// @ts-ignore
/* eslint-disable */
import {request} from '@umijs/max';

/** 上传文件 POST /api/fileInfo/upload */
export async function uploadFileUsingPOST1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {},
  file?: File,
  options?: { [key: string]: any },
) {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  }

  return request<API.BaseResponseFileInfo_>('/api/fileInfo/upload', {
    method: 'POST',
    params: {
      ...params,
    },
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}

/** 删除文件 POST /api/fileInfo/delete */
export async function deleteFileUsingPOST(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/fileInfo/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 预览文件 GET /api/fileInfo/preview */
export async function previewFileUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.previewFileUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseString_>('/api/fileInfo/preview', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取文件信息 GET /api/fileInfo/get */
export async function getFileInfoUsingGET(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFileInfoUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseFileInfo_>('/api/fileInfo/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 分页获取当前用户的文件列表 POST /api/fileInfo/list/my/page */
export async function listMyFileByPageUsingPOST(
  body: API.FileInfoQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageFileInfo>('/api/fileInfo/list/my/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页获取所有用户的文件列表（仅管理员） POST /api/fileInfo/list/page */
export async function listFileByPageUsingPOST(
  body: API.FileInfoQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageFileInfo_>('/api/fileInfo/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
