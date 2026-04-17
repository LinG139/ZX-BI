-- 创建 ai_session 表（如果不存在）
CREATE TABLE IF NOT EXISTS `ai_session` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `userId` bigint DEFAULT NULL,
  `sessionName` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `prompt` text,
  `createTime` datetime DEFAULT NULL,
  `updateTime` datetime DEFAULT NULL,
  `isDelete` int DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 添加 sessionId 列到 ai_chat 表
-- 注意：如果列已存在会报错，可以忽略该错误
ALTER TABLE `ai_chat` ADD COLUMN `sessionId` bigint DEFAULT NULL AFTER `id`;

-- 添加 isDelete 列到 ai_chat 表
-- 注意：如果列已存在会报错，可以忽略该错误
ALTER TABLE `ai_chat` ADD COLUMN `isDelete` int DEFAULT 0;