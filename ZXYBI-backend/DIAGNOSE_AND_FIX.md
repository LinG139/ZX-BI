# AI配置功能问题诊断与修复方案

## 🔍 问题诊断

"获取配置列表失败: undefined" 错误通常由以下原因导致：

### 1. 数据库表不存在
### 2. 数据库字段名不匹配
### 3. 后端服务未正确启动

## ✅ 立即执行以下步骤

### 步骤1：检查并创建数据库表

打开终端，按顺序执行以下命令：

```bash
# 1. 登录MySQL
mysql -u root -p

# 2. 输入密码（你之前说的是345678）

# 3. 选择数据库
USE liubi;

# 4. 检查表是否存在
SHOW TABLES LIKE 'ai_config';

# 5. 如果不存在，创建表
CREATE TABLE IF NOT EXISTS `ai_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `platform_type` varchar(50) NOT NULL COMMENT '平台类型',
  `platform_name` varchar(100) NOT NULL COMMENT '平台名称',
  `api_key` varchar(500) NOT NULL COMMENT 'API密钥',
  `secret` varchar(500) DEFAULT NULL COMMENT '密钥',
  `base_url` varchar(255) DEFAULT NULL COMMENT '基础URL',
  `chat_model_id` varchar(100) DEFAULT NULL COMMENT '聊天模型ID',
  `chart_model_id` varchar(100) DEFAULT NULL COMMENT '图表模型ID',
  `is_active` tinyint NOT NULL DEFAULT '0' COMMENT '是否启用',
  `timeout` int DEFAULT '30000' COMMENT '超时时间',
  `temperature` double DEFAULT '0.7' COMMENT '温度参数',
  `top_p` double DEFAULT '0.9' COMMENT 'topP参数',
  `max_tokens` int DEFAULT '4096' COMMENT '最大token数',
  `remark` text COMMENT '备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_delete` tinyint DEFAULT '0' COMMENT '是否删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='AI配置表';

# 6. 验证表结构
DESCRIBE ai_config;

# 7. 插入一个测试配置
INSERT INTO `ai_config` (`platform_type`, `platform_name`, `api_key`, `base_url`, `chat_model_id`, `chart_model_id`, `is_active`) 
VALUES ('zhipu', '智谱AI', 'test-api-key', 'https://open.bigmodel.cn/api/paas/v4', 'glm-4', 'glm-4', 0);

# 8. 验证数据
SELECT * FROM ai_config;

# 9. 退出
EXIT;
```

### 步骤2：重启后端服务

```bash
# 在后端项目目录中
cd d:\Code\ZX-BI-main\ZX-BI-main\ZXYBI-backend

# 停止当前运行的后端（Ctrl+C）

# 重新启动
mvn spring-boot:run
```

### 步骤3：测试接口

重新打开浏览器访问：
```
http://localhost:9001/api/doc.html
```

1. 登录接口：`/api/user/login`
   - 使用账户：123123
   - 密码：123123123

2. 获取配置列表：`/api/admin/ai-config/list`
   - 应该返回刚才插入的测试配置

## 🔧 如果仍然有问题

### 检查1：确认数据库连接配置

检查 `application.yml` 中的数据库配置：

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/liubi
    username: root
    password: 345678  # 确认密码是否正确
```

### 检查2：确认MySQL服务正在运行

```bash
# Windows
net start | findstr MySQL

# 或者
mysql -u root -p -e "SELECT 1"
```

### 检查3：查看后端日志

在后端控制台查看是否有数据库错误信息。

## 📝 快速诊断命令

将以下内容保存为 `diagnose.bat`：

```batch
@echo off
echo ========================================
echo AI配置功能诊断脚本
echo ========================================
echo.

echo [1/4] 检查MySQL服务状态...
netstat -an | findstr "3306"
echo.

echo [2/4] 登录MySQL并检查数据库...
mysql -u root -p345678 -e "USE liubi; SHOW TABLES LIKE 'ai_config';"
echo.

echo [3/4] 查看ai_config表结构...
mysql -u root -p345678 -e "USE liubi; DESCRIBE ai_config;"
echo.

echo [4/4] 查看ai_config表数据...
mysql -u root -p345678 -e "USE liubi; SELECT * FROM ai_config;"
echo.

echo ========================================
echo 诊断完成
echo ========================================
pause
```

## ✅ 验证清单

完成以上步骤后，确认：

- [ ] ai_config表存在
- [ ] 表结构包含所有必要字段
- [ ] 可以查询到数据
- [ ] 后端服务正常运行
- [ ] 可以访问 http://localhost:9001/api/doc.html
- [ ] 接口 `/api/admin/ai-config/list` 返回 code=0

## 📞 需要反馈

请告诉我：

1. **执行诊断脚本的结果是什么？**
2. **ai_config表是否存在？**
3. **插入测试数据是否成功？**
4. **后端服务是否正常运行？**

提供这些信息后，我可以帮你进一步解决问题。