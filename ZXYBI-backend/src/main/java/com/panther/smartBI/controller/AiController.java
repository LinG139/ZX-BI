package com.panther.smartBI.controller;

import com.panther.smartBI.ai.ZhiPuClient;
import com.panther.smartBI.common.BaseResponse;
import com.panther.smartBI.common.ResultUtils;
import com.panther.smartBI.constant.BiConstant;
import com.panther.smartBI.manager.AiManager;
import com.panther.smartBI.model.dto.ai.ChatRequest;
import com.panther.smartBI.model.dto.ai.StoryRequest;
import com.panther.smartBI.model.vo.ChatResponse;
import com.panther.smartBI.model.vo.StoryResponse;
import com.panther.smartBI.service.ChatHistoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

/**
 * @author Gin 琴酒
 * @data 2023/8/7 10:17
 */
@RestController
@RequestMapping("/ai")
@Slf4j
public class AiController {

    @Resource
    private AiManager aiManager;

    @Resource
    private ChatHistoryService chatHistoryService;

    /**
     * AI 聊天（支持历史记忆）
     * @return
     */
    @PostMapping("/chat")
    public BaseResponse<ChatResponse> genChat(ChatRequest chatRequest){
        Long userId = chatRequest.getUserId();
        Long sessionId = chatRequest.getSessionId();
        String message = chatRequest.getMessage();
        String prompt = chatRequest.getPrompt();
        String role = chatRequest.getRole();

        if (userId == null) {
            userId = 1L;
        }

        if (sessionId == null) {
            String sessionName = message.length() > 20 ? message.substring(0, 20) + "..." : message;
            sessionId = chatHistoryService.createSession(userId, role, prompt, sessionName);
            log.info("创建新会话: sessionId={}, userId={}, role={}", sessionId, userId, role);
        }

        List<ZhiPuClient.Message> history = chatHistoryService.getChatHistory(sessionId);
        log.info("获取历史消息: sessionId={}, 历史消息数={}", sessionId, history.size());

        String answer = aiManager.doChatWithHistory(
                BiConstant.CHAT_MODEL_ID,
                message,
                prompt,
                history
        );

        chatHistoryService.saveMessage(
                sessionId,
                userId,
                message,
                answer,
                chatRequest.getUserAvatar(),
                chatRequest.getAiAvatar(),
                chatRequest.getUserName(),
                chatRequest.getAiName()
        );
        log.info("保存对话记录: sessionId={}, userId={}", sessionId, userId);

        ChatResponse chatResponse = new ChatResponse();
        chatResponse.setAnswer(answer);
        chatResponse.setSessionId(sessionId);

        return ResultUtils.success(chatResponse);
    }

    /**
     * AI 生成故事
     * @return
     */
    @PostMapping("/genStory")
    public BaseResponse<StoryResponse> genStory(StoryRequest storyRequest){

        StoryResponse storyResponse = new StoryResponse();
        storyResponse.setTitle(storyRequest.getTitle());
        String content = aiManager.doChat(BiConstant.STORY_MODEL_ID, storyRequest.getTitle());
        storyResponse.setContent(content);

        return ResultUtils.success(storyResponse);
    }

    /**
     * AI 菩萨
     * @return
     */
    @PostMapping("/genPurdue")
    public BaseResponse<String> genPurdue(String worried){

        String content = aiManager.doChatByClient(BiConstant.PUSA_MODEl_ID, worried);

        return ResultUtils.success(content);
    }

}