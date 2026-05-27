# 智析云——智能BI分析平台 

## 📋 项目概述

智析云 BI 是基于 Spring Boot + RabbitMQ + AIGC + React 的智能数据分析平台。区别于传统 BI，用户只需要导入原始数据集、并输入分析诉求，就能自动生成可视化图表及分析结论，实现数据分析的降本增效。

### ✨ 核心特性

- **智能图表生成**：用户上传数据集，输入分析诉求，AI自动生成专业可视化图表
- **异步处理机制**：通过 RabbitMQ 实现任务队列，支持高并发场景
- **多AI提供商支持**：集成智谱AI、OpenAI等多种AI服务
- **用户积分系统**：支持积分管理、充值等功能
- **限流控制**：基于 Redisson 实现滑动窗口限流
- **文件处理**：支持 Excel 文件解析，自动转换为 CSV 格式
- **完整的用户系统**：支持用户注册、登录、权限管理

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

### 基础架构：
客户端输入分析诉求和原始数据，向业务后端发送请求。业务后端利用AI服务处理客户端数据，保持到数据库，并生成图表。处理后的数据由业务后端发送给AI服务，AI服务生成结果并返回给后端，最终将结果返回给客户端展示。
<img width="1307" height="775" alt="image" src="https://github.com/user-attachments/assets/072175b5-a878-4f87-9abe-a8286377eb00" />
### 项目异步化处理

优化流程（异步化）：客户端输入分析诉求和原始数据，向业务后端发送请求。业务后端将请求事件放入消息队列，并为客户端生成取餐号，让要生成图表的客户端去排队，消息队列根据I服务负载情况，定期检查进度，如果AI服务还能处理更多的图表生成请求，就向任务处理模块发送消息。

任务处理模块调用AI服务处理客户端数据，AI 服务异步生成结果返回给后端并保存到数据库，当后端的AI工服务生成完毕后，可以通过向前端发送通知的方式，或者通过业务后端监控数据库中图表生成服务的状态，来确定生成结果是否可用。若生成结果可用，前端即可获取并处理相应的数据，最终将结果返回给客户端展示。在此期间，用户可以去做自己的事情。

<img width="1315" height="760" alt="image" src="https://github.com/user-attachments/assets/9be2e7ba-ac70-4de2-9ee6-cd6820d76f4a" />

## 🎨 界面展示

### 登录注册页

<img width="2836" height="1458" alt="image" src="https://github.com/user-attachments/assets/62aca570-c49a-42e5-abbc-19f8f4c438f8" />

<img width="2833" height="1452" alt="image" src="https://github.com/user-attachments/assets/da9eb12f-d3e0-4a83-b1c3-0541e420b881" />


### 数据上传页

<img width="2843" height="1456" alt="image" src="https://github.com/user-attachments/assets/f1521066-5de5-4279-9780-71368d784ec8" />

<img width="2834" height="1450" alt="image" src="https://github.com/user-attachments/assets/6f328688-c793-4aed-bc89-15f3e0b16b0e" />

### 图表预览页

<img width="2829" height="1462" alt="image" src="https://github.com/user-attachments/assets/d9573ab1-28ff-46b9-b082-51c1b0fb3f8f" />

<img width="2831" height="1447" alt="image" src="https://github.com/user-attachments/assets/9af2ee8c-44da-4202-8446-2bfdc691389c" />


### 个人中心

<img width="2833" height="1425" alt="image" src="https://github.com/user-attachments/assets/2fd0bc8a-6984-4455-b296-993889c595cf" />


