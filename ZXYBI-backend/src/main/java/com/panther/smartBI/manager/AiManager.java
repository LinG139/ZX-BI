package com.panther.smartBI.manager;

import com.panther.smartBI.ai.YuCongMingClient;
import com.panther.smartBI.ai.ZhiPuClient;
import com.panther.smartBI.common.BaseResponse;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.model.chat.DevChatRequest;
import com.panther.smartBI.model.chat.DevChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
<<<<<<< HEAD
import java.util.List;
=======
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270

@Service
@Slf4j
public class AiManager {

    @Resource
    private YuCongMingClient yuCongMingClient;

    @Resource
    private ZhiPuClient zhiPuClient;

    @Value("${ai.provider:zhipu}")
    private String aiProvider;

    public String doChat(long modelId, String message){
<<<<<<< HEAD
        return doChat(modelId, message, null);
    }

    public String doChat(long modelId, String message, String prompt){
        log.info("使用AI提供商: {}, 模型ID: {}", aiProvider, modelId);

        if ("zhipu".equalsIgnoreCase(aiProvider)) {
            return doChatByZhiPu(message, false, prompt);
        } else {
            return doChatByYuCongMing(modelId, message, prompt);
=======
        log.info("使用AI提供商: {}, 模型ID: {}", aiProvider, modelId);
        
        if ("zhipu".equalsIgnoreCase(aiProvider)) {
            return doChatByZhiPu(message, false);
        } else {
            return doChatByYuCongMing(modelId, message);
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
        }
    }

    public String doChartAnalysis(long modelId, String message){
<<<<<<< HEAD
        return doChartAnalysis(modelId, message, null);
    }

    public String doChartAnalysis(long modelId, String message, String prompt){
        log.info("使用AI提供商: {}, 模型ID: {} (图表分析)", aiProvider, modelId);

        if ("zhipu".equalsIgnoreCase(aiProvider)) {
            return doChatByZhiPu(message, true, prompt);
        } else {
            return doChatByYuCongMing(modelId, message, prompt);
=======
        log.info("使用AI提供商: {}, 模型ID: {} (图表分析)", aiProvider, modelId);
        
        if ("zhipu".equalsIgnoreCase(aiProvider)) {
            return doChatByZhiPu(message, true);
        } else {
            return doChatByYuCongMing(modelId, message);
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
        }
    }

    public String doChatByClient(long modelId, String message){
<<<<<<< HEAD
        return doChatByClient(modelId, message, null);
    }

    public String doChatByClient(long modelId, String message, String prompt){
        log.info("使用AI提供商: {}, 模型ID: {}", aiProvider, modelId);

        if ("zhipu".equalsIgnoreCase(aiProvider)) {
            return doChatByZhiPu(message, false, prompt);
        } else {
            return doChatByYuCongMing(modelId, message, prompt);
        }
    }

    public String doChatWithHistory(long modelId, String message, String prompt, List<ZhiPuClient.Message> history){
        log.info("使用AI提供商: {}, 模型ID: {}, 历史消息数: {}", aiProvider, modelId, history.size());

        if ("zhipu".equalsIgnoreCase(aiProvider)) {
            return doChatByZhiPuWithHistory(message, false, prompt, history);
        } else {
            return doChatByYuCongMing(modelId, message, prompt);
        }
    }

    private String doChatByZhiPu(String message, boolean isChartAnalysis, String prompt) {
        try {
            return zhiPuClient.doChat(message, isChartAnalysis, prompt);
=======
        log.info("使用AI提供商: {}, 模型ID: {}", aiProvider, modelId);
        
        if ("zhipu".equalsIgnoreCase(aiProvider)) {
            return doChatByZhiPu(message, false);
        } else {
            return doChatByYuCongMing(modelId, message);
        }
    }

    private String doChatByZhiPu(String message, boolean isChartAnalysis) {
        try {
            return zhiPuClient.doChat(message, isChartAnalysis);
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("智谱AI调用过程中发生未预期异常", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 调用失败: " + e.getMessage());
        }
    }

<<<<<<< HEAD
    private String doChatByZhiPuWithHistory(String message, boolean isChartAnalysis, String prompt, List<ZhiPuClient.Message> history) {
        try {
            return zhiPuClient.doChatWithHistory(message, isChartAnalysis, prompt, history);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("智谱AI调用过程中发生未预期异常", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 调用失败: " + e.getMessage());
        }
    }

    private String doChatByYuCongMing(long modelId, String message, String prompt) {
        DevChatRequest devChatRequest = new DevChatRequest();
        devChatRequest.setModelId(modelId);
        String finalMessage = buildMessageWithPrompt(message, prompt);
        devChatRequest.setMessage(finalMessage);
=======
    private String doChatByYuCongMing(long modelId, String message) {
        DevChatRequest devChatRequest = new DevChatRequest();
        devChatRequest.setModelId(modelId);
        devChatRequest.setMessage(message);
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270

        try {
            BaseResponse<DevChatResponse> devChatResponseBaseResponse = yuCongMingClient.doChat(devChatRequest);
            if (devChatResponseBaseResponse == null) {
                log.error("AI 响应为 null");
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 响应异常");
            }
<<<<<<< HEAD

            if (devChatResponseBaseResponse.getCode() != 0) {
                log.error("AI 服务返回错误码: {}, 消息: {}",
                    devChatResponseBaseResponse.getCode(),
                    devChatResponseBaseResponse.getMessage());
                throw new BusinessException(ErrorCode.SYSTEM_ERROR,
                    "AI 服务异常: " + devChatResponseBaseResponse.getMessage());
            }

=======
            
            if (devChatResponseBaseResponse.getCode() != 0) {
                log.error("AI 服务返回错误码: {}, 消息: {}", 
                    devChatResponseBaseResponse.getCode(), 
                    devChatResponseBaseResponse.getMessage());
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, 
                    "AI 服务异常: " + devChatResponseBaseResponse.getMessage());
            }
            
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
            if (devChatResponseBaseResponse.getData() == null) {
                log.error("AI 响应数据为 null，完整响应: {}", devChatResponseBaseResponse);
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 响应数据为空");
            }
<<<<<<< HEAD

=======
            
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
            String content = devChatResponseBaseResponse.getData().getContent();
            if (content == null || content.trim().isEmpty()) {
                log.error("AI 返回内容为空");
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 返回内容为空");
            }
<<<<<<< HEAD

=======
            
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
            return content;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("鱼聪明AI调用过程中发生未预期异常", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 调用失败: " + e.getMessage());
        }
    }

<<<<<<< HEAD
    /**
     * 将prompt与消息合并
     */
    private String buildMessageWithPrompt(String message, String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return message;
        }
        return prompt + "\n\n用户问题：" + message;
    }

}
=======
}
>>>>>>> 0cc9b644bdc19feba39201e5a73ff5c5582cd270
