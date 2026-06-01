# 智析云 —— 基于AIGC的智能数据分析平台

统一的智能数据分析平台，将AI智能分析与可视化图表整合为可切换的应用模式，支持用户上传数据自动生成分析图表，同时提供AI聊天室和社区互动功能。

> **作者**：ZXYBI Team &nbsp;|&nbsp; **版本**：v1.9.0 &nbsp;|&nbsp; **许可证**：All rights reserved

## 功能模块

### 核心功能

| 图标 | 模块 | 说明 |
|------|------|------|
| 📊 | 智能图表生成 | 上传Excel/CSV数据，AI自动生成可视化图表和分析结论 |
| 💬 | AI聊天室 | 多角色AI对话，支持数据分析师、前端工程师、Java工程师等角色 |
| 👤 | 用户中心 | 注册登录、积分管理、个人信息维护 |
| 📁 | 文件管理 | Excel/CSV上传解析、头像上传、图表导出 |
| 🔧 | 系统监控 | 管理员仪表盘、系统状态监控、日志管理 |

### 图表生成模式

| 模式 | 说明 |
|------|------|
| 同步模式 | 即时分析，数据+诉求直接生成图表 |
| 线程池异步 | 后台处理，支持状态轮询 |
| MQ异步 | RabbitMQ队列，解耦异步任务 |

### 支持图表类型

折线图、柱状图、饼图、散点图、雷达图、K线图、热力图、漏斗图、仪表盘等

## 技术栈

### 后端技术

- **框架**: Spring Boot 2.7.x + MyBatis-Plus 3.5.x
- **数据库**: MySQL 5.7+（用户、图表、帖子等核心数据）
- **缓存**: Redis 6.0+（分布式会话、热点数据缓存）
- **消息队列**: RabbitMQ 3.8+（异步任务解耦）
- **搜索引擎**: Elasticsearch 7.x（全文搜索）
- **任务调度**: Spring Scheduler（定时重试补偿）
- **限流**: Redisson（滑动窗口限流）
- **文件存储**: 腾讯云COS（头像、文件对象存储）
- **AI集成**: 智谱AI SDK、鱼聪明AI（多供应商适配）

### 前端技术

- **框架**: React 18 + TypeScript
- **构建**: Umi 4
- **UI库**: Ant Design 5.x
- **图表**: ECharts 5.x
- **状态管理**: React Hooks / Umi状态管理

### 架构特点

- 前后端分离架构
- 同步/异步/MQ三模式处理
- 多AI供应商动态切换
- 滑动窗口限流保护
- 消息队列异步解耦
- 定时任务失败补偿

## 系统截图

<div align="center">
  <p align="center"><b>智能分析页面</b></p>
  <img src="screenshots/1.png" width="100%" alt="智能分析页面" />
  <br/><br/>
  <p align="center"><b>图表展示</b></p>
  <img src="screenshots/2.png" width="100%" alt="图表展示" />
  <br/><br/>
  <p align="center"><b>AI聊天室</b></p>
  <img src="screenshots/3.png" width="100%" alt="AI聊天室" />
  <br/><br/>
  <p align="center"><b>社区帖子</b></p>
  <img src="screenshots/4.png" width="100%" alt="社区帖子" />
  <br/><br/>
  <p align="center"><b>用户中心</b></p>
  <img src="screenshots/5.png" width="100%" alt="用户中心" />
  <br/><br/>
  <p align="center"><b>系统设置</b></p>
  <img src="screenshots/6.png" width="100%" alt="系统设置" />
</div>

## 快速开始

### 环境要求

- JDK 1.8+
- Node.js 16+
- MySQL 5.7+
- Redis 6.0+
- RabbitMQ 3.8+

### 后端启动

```bash
cd ZXYBI-backend

# 修改 application.yml 配置数据库、Redis、RabbitMQ、AI API密钥

# 启动后端服务 (端口 8080)
mvn spring-boot:run
```

### 前端启动

```bash
cd ZXYBI-frontend

# 安装依赖
npm install

# 启动前端开发服务器 (端口 3000)
npm run dev
```

打开 `http://localhost:3000`，注册账号后即可使用智能图表分析和AI聊天功能。

## 核心特性

### 智能图表生成

- 上传Excel/CSV文件（支持10万行数据）
- 输入分析诉求，AI自动解读数据意图
- 生成折线图、柱状图、饼图等多种图表
- 自动生成数据分析结论和洞察报告
- 三种处理模式：同步/线程池异步/MQ异步

### AI聊天室

- 多角色AI对话（数据分析师、前端工程师、Java工程师等）
- Markdown格式渲染和代码高亮
- 会话历史自动保存
- AI图片展示支持

### 用户系统

- 注册登录（Spring Session + Redis分布式会话）
- 积分系统（查询、充值、消费）
- 分布式会话（Spring Session + Redis）
- 角色权限控制（普通用户/VIP/管理员）
- 管理员功能：用户管理、图表管理、AI会话管理、积分管理、系统监控

### 系统保护

- Redisson滑动窗口限流
- 积分消费控制
- 失败任务自动重试补偿
- 敏感操作审计日志

## 项目结构

```
ZXYBI/
├── ZXYBI-backend/                  # Spring Boot后端
│   └── src/main/java/
│       └── com/panther/smartBI/
│           ├── controller/         # 控制器层
│           ├── service/           # 服务层
│           ├── mapper/            # 数据访问层
│           ├── model/             # 实体类
│           ├── manager/           # AI管理
│           └── config/            # 配置类
├── ZXYBI-frontend/                  # React前端
│   └── src/
│       ├── pages/                 # 页面组件
│       ├── components/            # 公共组件
│       ├── services/              # API服务
│       └── utils/                 # 工具函数
├── ZXYBI项目开发文档/               # 项目文档
│   ├── 1-项目建议书.md
│   ├── 2-可行性分析报告.md
│   ├── 3-需求规格说明书.md
│   ├── 4-项目计划书.md
│   ├── 5-Agent文档.md
│   ├── 6-项目开发日志.md
│   ├── 7-版本更新日志.md
│   ├── 8-项目质量计划书.md
│   ├── 9-项目质量检查报告.md
│   ├── 10-代码评审报告.md
│   ├── 11-安全审查报告.md
│   ├── 12-Readme文档.md
│   ├── 13-测试用例与测试报告.md
│   └── 14-项目验收报告.md
```

## 版本

v1.0.0 ~ v1.9.0，详见 [7-版本更新日志.md](ZXYBI项目开发文档/7-版本更新日志.md)

---

© 2026 ZXYBI Team. All rights reserved.
