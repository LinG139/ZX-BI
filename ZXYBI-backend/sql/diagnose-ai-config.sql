-- AI配置数据库诊断脚本

-- 1. 检查数据库是否存在
SHOW DATABASES LIKE 'liubi';

-- 2. 检查ai_config表是否存在
USE liubi;
SHOW TABLES LIKE 'ai_config';

-- 3. 查看ai_config表结构
DESCRIBE ai_config;

-- 4. 查看所有数据
SELECT * FROM ai_config;

-- 5. 检查字段类型是否匹配
-- 预期字段（数据库）: id, platform_type, platform_name, api_key, secret, base_url, 
--                     chat_model_id, chart_model_id, is_active, timeout, temperature, 
--                     top_p, max_tokens, remark, create_time, update_time, is_delete

-- 6. 如果表不存在，创建表
CREATE TABLE IF NOT EXISTS `ai_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `platform_type` varchar(50) NOT NULL COMMENT '平台类型（zhipu/qwen/baidu/claude/deepseek/gemini/openai/xunfei）',
  `platform_name` varchar(100) NOT NULL COMMENT '平台名称',
  `api_key` varchar(500) NOT NULL COMMENT 'API密钥',
  `secret` varchar(500) DEFAULT NULL COMMENT '密钥（部分平台需要）',
  `base_url` varchar(255) DEFAULT NULL COMMENT '基础URL',
  `chat_model_id` varchar(100) DEFAULT NULL COMMENT '聊天模型ID',
  `chart_model_id` varchar(100) DEFAULT NULL COMMENT '图表模型ID',
  `is_active` tinyint NOT NULL DEFAULT '0' COMMENT '是否启用（0-禁用，1-启用）',
  `timeout` int DEFAULT '30000' COMMENT '超时时间（毫秒）',
  `temperature` double DEFAULT '0.7' COMMENT '温度参数',
  `top_p` double DEFAULT '0.9' COMMENT 'topP参数',
  `max_tokens` int DEFAULT '4096' COMMENT '最大token数',
  `remark` text COMMENT '备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_delete` tinyint DEFAULT '0' COMMENT '是否删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='AI配置表';

-- 7. 验证创建结果
SHOW TABLES LIKE 'ai_config';
DESCRIBE ai_config;

-- 8. 插入测试数据（可选）
-- INSERT INTO `ai_config` (`platform_type`, `platform_name`, `api_key`, `base_url`, `chat_model_id`, `chart_model_id`, `is_active`) 
-- VALUES ('zhipu', '智谱AI', 'test-key', 'https://open.bigmodel.cn/api/paas/v4', 'glm-4', 'glm-4', 0);