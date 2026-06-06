-- 修复数据库缺失字段脚本
USE liubi;

-- 1. 检查并修复 login_log 表
-- 如果 login_log 表没有 createTime 字段，添加它
SET @dbname = DATABASE();
SET @tablename = 'login_log';
SET @columnname = 'createTime';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT \'创建时间\'')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. 检查并修复 operation_log 表
SET @tablename = 'operation_log';
SET @columnname = 'errorMessage';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `errorMessage` varchar(1024) DEFAULT NULL COMMENT \'错误信息\'')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 3. 显示修复后的表结构
DESCRIBE login_log;
DESCRIBE operation_log;
