-- 充值记录表
CREATE TABLE IF NOT EXISTS `recharge_record` (
  `id` bigint NOT NULL COMMENT 'id',
  `userId` bigint NOT NULL COMMENT '用户id',
  `userName` varchar(256) DEFAULT NULL COMMENT '用户昵称',
  `amount` int NOT NULL DEFAULT 0 COMMENT '充值数量',
  `beforeCount` int NOT NULL DEFAULT 0 COMMENT '充值前积分',
  `afterCount` int NOT NULL DEFAULT 0 COMMENT '充值后积分',
  `type` varchar(256) DEFAULT NULL COMMENT '类型',
  `remark` varchar(1024) DEFAULT NULL COMMENT '备注',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `isDelete` tinyint NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`),
  INDEX idx_userId (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值记录表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS `operation_log` (
  `id` bigint NOT NULL COMMENT 'id',
  `userId` bigint DEFAULT NULL COMMENT '用户id',
  `userName` varchar(256) DEFAULT NULL COMMENT '用户昵称',
  `operation` varchar(256) DEFAULT NULL COMMENT '操作',
  `module` varchar(256) DEFAULT NULL COMMENT '模块',
  `method` varchar(512) DEFAULT NULL COMMENT '请求方法',
  `ip` varchar(64) DEFAULT NULL COMMENT 'ip地址',
  `location` varchar(256) DEFAULT NULL COMMENT '位置',
  `status` int DEFAULT 1 COMMENT '状态 0失败 1成功',
  `errorMessage` varchar(1024) DEFAULT NULL COMMENT '错误信息',
  `params` text COMMENT '请求参数',
  `result` text COMMENT '返回结果',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `duration` bigint DEFAULT 0 COMMENT '执行时长(毫秒)',
  `isDelete` tinyint NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`),
  INDEX idx_userId (`userId`),
  INDEX idx_createTime (`createTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 登录日志表
CREATE TABLE IF NOT EXISTS `login_log` (
  `id` bigint NOT NULL COMMENT 'id',
  `userId` bigint DEFAULT NULL COMMENT '用户id',
  `userName` varchar(256) DEFAULT NULL COMMENT '用户昵称',
  `ip` varchar(64) DEFAULT NULL COMMENT 'ip地址',
  `location` varchar(256) DEFAULT NULL COMMENT '位置',
  `device` varchar(512) DEFAULT NULL COMMENT '设备信息',
  `status` int DEFAULT 1 COMMENT '状态 0失败 1成功',
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `isDelete` tinyint NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`),
  INDEX idx_userId (`userId`),
  INDEX idx_createTime (`createTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录日志表';
