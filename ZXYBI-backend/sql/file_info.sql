-- 文件信息表
CREATE TABLE IF NOT EXISTS `file_info` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `fileName` varchar(255) NOT NULL COMMENT '文件名称',
  `fileFormat` varchar(50) NOT NULL COMMENT '文件格式',
  `fileSize` bigint NOT NULL COMMENT '文件大小(字节)',
  `filePath` varchar(500) NOT NULL COMMENT '文件存储路径',
  `fileMd5` varchar(32) NOT NULL COMMENT '文件MD5',
  `userId` bigint NOT NULL COMMENT '所属用户ID',
  `categoryId` bigint DEFAULT NULL COMMENT '分类ID',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除 0:否 1:是',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_md5` (`userId`, `fileMd5`),
  KEY `idx_user_id` (`userId`),
  KEY `idx_category_id` (`categoryId`),
  KEY `idx_file_format` (`fileFormat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件信息表';

-- 文件分类表
CREATE TABLE IF NOT EXISTS `file_category` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `categoryName` varchar(100) NOT NULL COMMENT '分类名称',
  `fileSuffixes` varchar(500) NOT NULL COMMENT '文件后缀，多个用逗号分隔',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除 0:否 1:是',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_name` (`categoryName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件分类表';

-- 初始化默认分类数据
INSERT INTO `file_category` (`categoryName`, `fileSuffixes`) VALUES 
('Excel文件', 'xlsx,xls,ods'),
('CSV文件', 'csv'),
('文本文件', 'txt,dat'),
('JSON文件', 'json'),
('其他文件', 'parquet,db');
