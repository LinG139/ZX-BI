import {
  listFileByPageUsingPOST,
  deleteFileUsingPOST,
  previewFileUsingGET,
} from '@/services/yubi/fileInfoController';
import {
  listFileCategoryUsingGET,
} from '@/services/yubi/fileCategoryController';
import {
  Button,
  Card,
  message,
  Modal,
  Space,
  Tag,
  Popconfirm,
  Table,
  Select,
  Tooltip,
  Form,
  Input,
} from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import React, {useEffect, useState} from 'react';

const FileManagePage: React.FC = () => {
  const [fileList, setFileList] = useState<API.FileInfo[]>([]);
  const [categoryList, setCategoryList] = useState<API.FileCategory[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    fileName: '',
    fileFormat: '',
    categoryId: undefined as number | undefined,
  });

  /**
   * 加载文件数据
   */
  const loadData = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await listFileByPageUsingPOST({
        current: page,
        pageSize: size,
        sortField: 'createTime',
        sortOrder: 'desc',
        fileName: filters.fileName || undefined,
        fileFormat: filters.fileFormat || undefined,
        categoryId: filters.categoryId,
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
   * 加载分类数据
   */
  const loadCategories = async () => {
    try {
      const res = await listFileCategoryUsingGET();
      if (res.code === 0 && res.data) {
        setCategoryList(res.data);
      }
    } catch (e: any) {
      console.error('获取分类列表失败', e);
    }
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
   * 搜索
   */
  const handleSearch = (values: any) => {
    setFilters({
      fileName: values.fileName || '',
      fileFormat: values.fileFormat || '',
      categoryId: values.categoryId,
    });
    loadData(1, pageSize);
  };

  /**
   * 重置
   */
  const handleReset = () => {
    form.resetFields();
    setFilters({
      fileName: '',
      fileFormat: '',
      categoryId: undefined,
    });
    loadData(1, pageSize);
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
   * 获取分类名称
   */
  const getCategoryName = (categoryId: number | undefined) => {
    if (!categoryId) return '-';
    const category = categoryList.find(c => c.id === categoryId);
    return category?.categoryName || '-';
  };

  /**
   * 表格列定义
   */
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
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
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: number) => getCategoryName(categoryId),
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: API.FileInfo) => (
        <Space size="middle">
          <Tooltip title="预览">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => previewFile(record.id as number, record.fileName || '')}
            />
          </Tooltip>
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
    loadCategories();
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <div className="file-manage-page" style={{padding: '24px'}}>
      <Card title="文件管理">
        <Form
          form={form}
          layout="inline"
          style={{marginBottom: 16}}
          onFinish={handleSearch}
        >
          <Form.Item name="fileName" label="文件名">
            <Input placeholder="请输入文件名" allowClear style={{width: 200}} />
          </Form.Item>
          <Form.Item name="fileFormat" label="文件格式">
            <Select placeholder="请选择文件格式" allowClear style={{width: 150}}>
              <Select.Option value="csv">CSV</Select.Option>
              <Select.Option value="xlsx">Excel</Select.Option>
              <Select.Option value="xls">Excel</Select.Option>
              <Select.Option value="txt">TXT</Select.Option>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="ods">ODS</Select.Option>
              <Select.Option value="parquet">Parquet</Select.Option>
              <Select.Option value="db">SQLite</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="categoryId" label="分类">
            <Select placeholder="请选择分类" allowClear style={{width: 150}}>
              {categoryList.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

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

export default FileManagePage;
