import {
  listMyFileByPageUsingPOST,
  uploadFileUsingPOST1,
  deleteFileUsingPOST,
  previewFileUsingGET,
} from '@/services/yubi/fileInfoController';
import {
  Button,
  Card,
  message,
  Modal,
  Upload,
  Space,
  Tag,
  Popconfirm,
  Table,
  Tooltip,
  Dropdown,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  BarChartOutlined,
  DownOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {useNavigate} from 'umi';
import React, {useEffect, useState} from 'react';
import type {UploadProps, MenuProps} from 'antd';
import type {RcFile} from 'antd/es/upload';

const MyDataSourcePage: React.FC = () => {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<API.FileInfo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');

  /**
   * 加载数据
   */
  const loadData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await listMyFileByPageUsingPOST({
        current: page,
        pageSize: size,
        sortField: 'createTime',
        sortOrder: 'desc',
      });
      const data = res?.data;
      if (res.code === 0 && data) {
        setFileList(data?.records ?? []);
        setTotal(data.total ?? 0);
        setCurrent(page);
        setPageSize(size);
      } else {
        message.error('获取文件列表失败');
      }
    } catch (e: any) {
      message.error('获取文件列表失败', e.message);
    }
    setLoading(false);
  };

  /**
   * 删除文件
   */
  const deleteFile = async (fileId: number) => {
    if (fileId === undefined) {
      message.error('id为空');
      return;
    }
    try {
      const res = await deleteFileUsingPOST({id: fileId});
      if (res.code === 0) {
        message.success('删除成功');
        loadData(current, pageSize);
      } else {
        message.error('删除失败');
      }
    } catch (e: any) {
      message.error('删除失败', e.message);
    }
  };

  /**
   * 预览文件
   */
  const previewFile = async (fileId: number, fileName: string) => {
    try {
      const res = await previewFileUsingGET({id: fileId});
      if (res.code === 0 && res.data !== undefined) {
        setPreviewContent(res.data);
        setPreviewFileName(fileName);
        setPreviewModalVisible(true);
      } else {
        message.error('预览失败');
      }
    } catch (e: any) {
      message.error('预览失败', e.message);
    }
  };

  /**
   * 去分析
   */
  const goToAnalyze = (file: API.FileInfo, mode: 'sync' | 'async' | 'mq') => {
    let path = '';
    switch (mode) {
      case 'sync':
        path = '/add_chart';
        break;
      case 'async':
        path = '/add_chart_async';
        break;
      case 'mq':
        path = '/add_chart_mq';
        break;
    }
    // 直接传递整个文件信息对象，避免二次查询
    navigate(path, {
      state: {
        fileInfo: file,
      },
    });
  };

  /**
   * 获取分析模式菜单
   */
  const getAnalyzeMenu = (file: API.FileInfo): MenuProps['items'] => [
    {
      key: 'sync',
      label: (
        <Space>
          <ThunderboltOutlined />
          <span>同步分析</span>
        </Space>
      ),
      onClick: () => goToAnalyze(file, 'sync'),
    },
    {
      key: 'async',
      label: (
        <Space>
          <ClockCircleOutlined />
          <span>异步分析</span>
        </Space>
      ),
      onClick: () => goToAnalyze(file, 'async'),
    },
    {
      key: 'mq',
      label: (
        <Space>
          <SendOutlined />
          <span>队列分析</span>
        </Space>
      ),
      onClick: () => goToAnalyze(file, 'mq'),
    },
  ];

  /**
   * 文件上传
   */
  const uploadProps: UploadProps = {
    name: 'file',
    showUploadList: false,
    beforeUpload: async (file: RcFile) => {
      setLoading(true);
      try {
        const res = await uploadFileUsingPOST1({}, file);
        if (res.code === 0) {
          message.success('上传成功');
          loadData(current, pageSize);
        } else {
          message.error(res.message || '上传失败');
        }
      } catch (e: any) {
        message.error('上传失败: ' + (e.message || '未知错误'));
      }
      setLoading(false);
      return false;
    },
  };

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * 表格列定义
   */
  const columns = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: '文件格式',
      dataIndex: 'fileFormat',
      key: 'fileFormat',
      render: (format: string) => <Tag color="blue">{format}</Tag>,
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: API.FileInfo) => (
        <Space size="middle">
          <Tooltip title="预览">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => previewFile(record.id as number, record.fileName || '')}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: getAnalyzeMenu(record),
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Tooltip title="去分析">
              <Button
                type="text"
                icon={
                  <Space>
                    <BarChartOutlined />
                    <DownOutlined />
                  </Space>
                }
              />
            </Tooltip>
          </Dropdown>
          <Popconfirm
            title="确定要删除这个文件吗？"
            onConfirm={() => deleteFile(record.id as number)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="my-data-source-page" style={{padding: '24px'}}>
      <Card title="我的数据源">
        <div style={{marginBottom: 16, textAlign: 'right'}}>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />}>
              上传文件
            </Button>
          </Upload>
        </div>
        <Table
          columns={columns}
          dataSource={fileList}
          rowKey="id"
          loading={loading}
          pagination={{
            current: current,
            pageSize: pageSize,
            total: total,
            onChange: (page, size) => loadData(page, size),
          }}
        />
      </Card>

      <Modal
        title={previewFileName}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <div
          style={{
            maxHeight: '60vh',
            overflow: 'auto',
            background: '#f5f5f5',
            padding: '16px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
          }}
        >
          {previewContent}
        </div>
      </Modal>
    </div>
  );
};

export default MyDataSourcePage;
