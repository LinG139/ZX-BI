-- 安全添加isVip字段的脚本
-- 检查字段是否存在，如果不存在则添加
SET @dbname = DATABASE();
SET @tablename = 'user';
SET @columnname = 'isVip';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` tinyint NOT NULL DEFAULT 0 COMMENT ''是否VIP''')
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
