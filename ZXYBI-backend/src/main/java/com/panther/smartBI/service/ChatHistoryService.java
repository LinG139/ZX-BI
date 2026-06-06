package com.panther.smartBI.service;

import com.panther.smartBI.ai.ZhiPuClient;
import com.panther.smartBI.mapper.AiChatMapper;
import com.panther.smartBI.mapper.AiSessionMapper;
import com.panther.smartBI.model.entity.AiChat;
import com.panther.smartBI.model.entity.AiSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class ChatHistoryService {

    @Resource
    private AiChatMapper aiChatMapper;

    @Resource
    private AiSessionMapper aiSessionMapper;

    private static final int MAX_HISTORY_SIZE = 10;

    public Long createSession(Long userId, String role, String prompt, String sessionName) {
        AiSession session = new AiSession();
        session.setUserId(userId);
        session.setRole(role);
        session.setPrompt(prompt);
        session.setSessionName(sessionName);
        session.setCreateTime(new Date());
        session.setUpdateTime(new Date());
        session.setIsDelete(0);
        aiSessionMapper.insert(session);
        return session.getId();
    }

    public void saveMessage(Long sessionId, Long userId, String userMessage, String aiMessage,
                           String userAvatar, String aiAvatar, String userName, String aiName) {
        AiChat chat = new AiChat();
        chat.setSessionId(sessionId);
        chat.setUserId(userId);
        chat.setUserMessage(userMessage);
        chat.setAiMessage(aiMessage);
        chat.setUserAvatar(userAvatar);
        chat.setAiAvatar(aiAvatar);
        chat.setUserName(userName);
        chat.setAiName(aiName);
        chat.setCreateTime(new Date());
        chat.setUpdateTime(new Date());
        chat.setIsDelete(0);
        aiChatMapper.insert(chat);
        log.info("保存聊天记录: sessionId={}, userId={}", sessionId, userId);
    }

    public List<ZhiPuClient.Message> getChatHistory(Long sessionId) {
        List<AiChat> chatList = aiChatMapper.selectBySessionId(sessionId);
        List<ZhiPuClient.Message> history = new ArrayList<>();

        int count = 0;
        for (AiChat chat : chatList) {
            if (count >= MAX_HISTORY_SIZE) {
                break;
            }

            if (chat.getUserMessage() != null && !chat.getUserMessage().trim().isEmpty()) {
                history.add(new ZhiPuClient.Message("user", chat.getUserMessage()));
                count++;
            }

            if (chat.getAiMessage() != null && !chat.getAiMessage().trim().isEmpty()) {
                history.add(new ZhiPuClient.Message("assistant", chat.getAiMessage()));
                count++;
            }
        }

        log.info("获取聊天历史: sessionId={}, 历史消息数={}", sessionId, history.size());
        return history;
    }

    public List<AiSession> getUserSessions(Long userId) {
        return aiSessionMapper.selectByUserId(userId);
    }

    public AiSession getSession(Long sessionId) {
        return aiSessionMapper.selectById(sessionId);
    }

    public void deleteSession(Long sessionId) {
        aiSessionMapper.deleteById(sessionId);
        aiChatMapper.deleteBySessionId(sessionId);
        log.info("删除会话: sessionId={}", sessionId);
    }

    /**
     * 删除指定时间之前的聊天记录
     *
     * @param expireTime 过期时间
     * @return 删除的记录数
     */
    public int deleteExpiredChats(LocalDateTime expireTime) {
        log.debug("开始删除过期聊天记录，过期时间: {}", expireTime);
        int deletedCount = aiChatMapper.deleteExpiredChats(expireTime);
        log.debug("已删除过期聊天记录: {} 条", deletedCount);
        return deletedCount;
    }

    /**
     * 删除指定时间之前的会话记录
     *
     * @param expireTime 过期时间
     * @return 删除的记录数
     */
    public int deleteExpiredSessions(LocalDateTime expireTime) {
        log.debug("开始删除过期会话记录，过期时间: {}", expireTime);
        int deletedCount = aiSessionMapper.deleteExpiredSessions(expireTime);
        log.debug("已删除过期会话记录: {} 条", deletedCount);
        return deletedCount;
    }
}