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

-- 创建 ai_chat 表（如果不存在）
CREATE TABLE IF NOT EXISTS `ai_chat` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sessionId` bigint DEFAULT NULL,
  `userId` bigint DEFAULT NULL,
  `userAvatar` varchar(255) DEFAULT NULL,
  `userMessage` text,
  `AIMessage` text,
  `AIAvatar` varchar(255) DEFAULT NULL,
  `messageType` varchar(255) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  `updateTime` datetime DEFAULT NULL,
  `userName` varchar(255) DEFAULT NULL,
  `AIName` varchar(255) DEFAULT NULL,
  `isDelete` int DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 添加索引
ALTER TABLE `ai_chat` ADD INDEX `idx_sessionId` (`sessionId`);
ALTER TABLE `ai_chat` ADD INDEX `idx_userId` (`userId`);
ALTER TABLE `ai_session` ADD INDEX `idx_userId` (`userId`);
