# 智析云——智能BI分析平台

## 📋 项目概述

智析云 BI 是基于 Spring Boot + RabbitMQ + AIGC + React 的智能数据分析平台。区别于传统 BI，用户只需要导入原始数据集、并输入分析诉求，就能自动生成可视化图表及分析结论，实现数据分析的降本增效。

### ✨ 核心特性

- **智能图表生成**：支持同步、异步线程池、MQ消息队列三种模式生成图表
- **AI智能分析**：基于智谱AI分析数据，生成专业可视化图表
- **多角色AI聊天室**：数据分析师、前端工程师、Java工程师等多角色对话
- **异步处理机制**：通过 RabbitMQ 实现任务队列，支持高并发场景
- **用户积分系统**：支持积分管理、充值、扣减等功能
- **管理员后台**：用户管理、图表管理、AI会话管理、积分管理、系统监控
- **限流控制**：基于 Redisson 实现滑动窗口限流
- **文件处理**：支持 Excel 文件解析，自动转换为 CSV 格式
- **分布式会话**：基于 Spring Session + Redis 实现用户认证与会话共享

### 🔄 业务流程

```
客户端上传数据 → 后端保存原始数据 → 发送消息到 RabbitMQ →
消费者消费消息 → 调用AI分析 → 生成图表 → 更新数据库 → 前端展示
```

---

## 🎯 前端技术栈

| 分类 | 技术 | 版本 |
| :--- | :--- | :--- |
| 开发框架 | React | 18 |
| 脚手架 | Umi | 4 |
| UI组件 | Ant Design | 5.x |
| 图表库 | ECharts | 5.x |
| 语法扩展 | TypeScript | - |
| 样式 | Less | - |
| 打包工具 | Webpack | - |
| 代码规范 | ESLint / Prettier | - |

---

## ⚙️ 后端技术栈

| 分类 | 技术 | 版本 |
| :--- | :--- | :--- |
| 主语言 | Java | 1.8 |
| 核心框架 | Spring Boot | 2.7.2 |
| ORM框架 | MyBatis-Plus | 3.5.2 |
| 数据库 | MySQL | 5.7+ |
| 缓存 | Redis | 6.0+ |
| 限流 | Redisson | 3.21.3 |
| 消息队列 | RabbitMQ | 3.8+ |
| AI服务 | 智谱AI SDK | 0.3.3 |
| 文件处理 | EasyExcel | 3.1.1 |
| 接口文档 | Knife4j | 3.0.3 |
| 工具类 | Hutool | 5.8.8 |

---

## 🏗️ 架构设计

### 基础架构

客户端输入分析诉求和原始数据，向业务后端发送请求。业务后端利用AI服务处理客户端数据，保存到数据库，并生成图表。处理后的数据由业务后端发送给AI服务，AI服务生成结果并返回给后端，最终将结果返回给客户端展示。

### 项目异步化处理

优化流程（异步化）：客户端输入分析诉求和原始数据，向业务后端发送请求。业务后端将请求事件放入消息队列，并为客户端生成取餐号，让要生成图表的客户端去排队，消息队列根据AI服务负载情况，定期检查进度，如果AI服务还能处理更多的图表生成请求，就向任务处理模块发送消息。

任务处理模块调用AI服务处理客户端数据，AI 服务异步生成结果返回给后端并保存到数据库，当后端的AI服务生成完毕后，可以通过向前端发送通知的方式，或者通过业务后端监控数据库中图表生成服务的状态，来确定生成结果是否可用。若生成结果可用，前端即可获取并处理相应的数据，最终将结果返回给客户端展示。在此期间，用户可以去做自己的事情。

---

## 📁 功能模块

### 用户系统

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录 | /user/login | 用户登录，支持分布式Session |
| 注册 | /user/register | 用户注册 |
| 个人设置 | /user/settings | 个人信息修改、头像上传 |

### 智能图表生成

| 页面 | 路径 | 说明 |
|------|------|------|
| 同步模式 | /addChart | 同步生成图表，立即返回结果 |
| 异步线程池模式 | /addChartAsync | 线程池异步处理，轮询获取结果 |
| MQ消息队列模式 | /addChartMQ | RabbitMQ队列处理，支持高并发 |

### 图表管理

| 页面 | 路径 | 说明 |
|------|------|------|
| 我的图表 | /myChart | 查看个人所有图表 |
| 图表详情 | /chartDetail | 查看图表详细信息 |

### AI聊天室

| 页面 | 路径 | 说明 |
|------|------|------|
| AI对话 | /story | 多角色AI对话，支持Markdown渲染 |

### 积分与充值

| 页面 | 路径 | 说明 |
|------|------|------|
| 充值中心 | /recharge | 积分充值 |

### 管理员后台

| 页面 | 路径 | 说明 |
|------|------|------|
| 仪表盘 | /admin/Dashboard | 用户统计、图表统计、AI使用统计 |
| 用户管理 | /admin/UserManage | 用户列表、角色修改、状态管理 |
| 图表管理 | /admin/ChartManage | 所有用户图表管理 |
| AI会话管理 | /admin/AiManage | AI会话列表、聊天记录管理 |
| 积分管理 | /admin/PointsManage | 用户积分调整、充值记录 |
| 系统监控 | /admin/Monitor | Redis状态、MQ状态、系统资源监控 |
| 日志管理 | /admin/Logs | 操作日志、登录日志查看 |

---

## 🎨 界面展示

### 登录注册页

![登录页面]()

![注册页面]()

### 数据上传页

![数据上传页面]()

### 图表预览页

![图表预览页面]()

### 个人中心

![个人中心]()

### 管理员仪表盘

![管理员仪表盘]()

### 管理员用户管理

![用户管理]()

### AI聊天室

![AI聊天室]()

---

## 📂 项目结构

```
├── ZXYBI-backend/                     # Spring Boot后端
│   └── src/main/java/com/panther/smartBI/
│       ├── controller/                 # 控制器层
│       │   ├── UserController.java    # 用户接口
│       │   ├── ChartController.java   # 图表接口
│       │   ├── AiController.java      # AI对话接口
│       │   ├── FileController.java     # 文件上传接口
│       │   ├── AdminController.java    # 管理员接口
│       │   └── QueueController.java    # 异步队列接口
│       ├── service/                   # 服务层
│       │   ├── UserService.java
│       │   ├── ChartService.java
│       │   ├── MonitorService.java    # 系统监控服务
│       │   └── ChatHistoryService.java # AI聊天记录服务
│       ├── mapper/                    # 数据访问层
│       ├── model/                     # 数据模型
│       │   ├── entity/               # 实体类
│       │   ├── dto/                  # 数据传输对象
│       │   ├── vo/                   # 视图对象
│       │   └── enums/                # 枚举类
│       ├── config/                   # 配置类
│       ├── mq/                       # 消息队列
│       ├── job/                      # 定时任务
│       └── aop/                      # 切面处理
├── ZXYBI-frontend/                    # React前端
│   └── src/
│       ├── pages/                    # 页面组件
│       │   ├── User/                # 用户相关页面
│       │   ├── AddChart/            # 同步图表生成
│       │   ├── AddChartAsync/       # 异步图表生成
│       │   ├── AddChartMQ/          # MQ图表生成
│       │   ├── MyChart/             # 我的图表
│       │   ├── ChartDetail/          # 图表详情
│       │   ├── story/               # AI聊天室
│       │   ├── Recharge/            # 充值中心
│       │   └── Admin/               # 管理员后台
│       ├── components/              # 公共组件
│       └── services/                # API服务
└── README.md
```

---

## 🔧 快速开始

### 环境要求

- JDK 1.8+
- Node.js 16+
- MySQL 5.7+
- Redis 6.0+
- RabbitMQ 3.8+

### 后端启动

1. 配置 MySQL、Redis、RabbitMQ 连接信息
2. 执行数据库脚本初始化表结构
3. 修改 `application.yml` 中的相关配置
4. 运行 `MainApplication.java` 启动后端服务

### 前端启动

```bash
cd ZXYBI-frontend
npm install
npm run dev
```

### 访问地址

- 前端地址：http://localhost:8000
- 后端地址：http://localhost:9001
- Knife4j文档：http://localhost:9001/doc.html

---

## 👥 权限说明

| 角色 | 权限范围 |
|------|----------|
| 普通用户 | 创建图表、使用AI聊天室、管理个人信息、查看个人积分 |
| VIP用户 | 享受更高积分额度、优先处理权限 |
| 管理员 | 用户管理、图表管理、AI会话管理、积分管理、系统监控 |

---

## 📝 版本日志

详见 [ZXYBI项目开发文档/7-版本更新日志.md](ZXYBI项目开发文档/7-版本更新日志.md)
