package com.panther.smartBI.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.LocalDateTime;

/**
 * 聊天记录清理服务
 * 负责定时清理超过24小时的对话记录
 */
@Slf4j
@Service
public class ChatCleanupService {

    @Resource
    private ChatHistoryService chatHistoryService;

    /**
     * 定时清理超过24小时的聊天记录
     * 每24小时执行一次（每天凌晨2点执行）
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void cleanupExpiredChats() {
        log.info("========== 开始执行聊天记录清理任务 ==========");
        
        try {
            LocalDateTime startTime = LocalDateTime.now();
            log.info("清理任务开始时间: {}", startTime);
            
            // 计算24小时前的时间
            LocalDateTime expireTime = startTime.minusHours(24);
            log.info("清理条件: 删除创建时间早于 {} 的记录", expireTime);
            
            // 删除过期的聊天记录
            int chatDeletedCount = chatHistoryService.deleteExpiredChats(expireTime);
            log.info("已删除过期聊天消息记录: {} 条", chatDeletedCount);
            
            // 删除过期的会话记录
            int sessionDeletedCount = chatHistoryService.deleteExpiredSessions(expireTime);
            log.info("已删除过期会话记录: {} 条", sessionDeletedCount);
            
            LocalDateTime endTime = LocalDateTime.now();
            long duration = java.time.Duration.between(startTime, endTime).toMillis();
            log.info("清理任务结束时间: {}, 耗时: {} 毫秒", endTime, duration);
            
            log.info("========== 聊天记录清理任务执行完成 ==========");
            
        } catch (Exception e) {
            log.error("聊天记录清理任务执行失败", e);
            throw e;
        }
    }

    /**
     * 手动触发清理（用于测试）
     */
    @Transactional(rollbackFor = Exception.class)
    public void triggerCleanup() {
        log.info("手动触发聊天记录清理任务");
        cleanupExpiredChats();
    }
}