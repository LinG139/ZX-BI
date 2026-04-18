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
        log.info("使用AI提供商: {}, 模型ID: {}", aiProvider, modelId);
        
        if ("zhipu".equalsIgnoreCase(aiProvider)) {
            return doChatByZhiPu(message, false);
        } else {
            return doChatByYuCongMing(modelId, message);
        }
    }

    public String doChartAnalysis(long modelId, String message){
        log.info("使用AI提供商: {}, 模型ID: {} (图表分析)", aiProvider, modelId);
        
        if ("zhipu".equalsIgnoreCase(aiProvider)) {
            return doChatByZhiPu(message, true);
        } else {
            return doChatByYuCongMing(modelId, message);
        }
    }

    public String doChatByClient(long modelId, String message){
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
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("智谱AI调用过程中发生未预期异常", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 调用失败: " + e.getMessage());
        }
    }

    private String doChatByYuCongMing(long modelId, String message) {
        DevChatRequest devChatRequest = new DevChatRequest();
        devChatRequest.setModelId(modelId);
        devChatRequest.setMessage(message);

        try {
            BaseResponse<DevChatResponse> devChatResponseBaseResponse = yuCongMingClient.doChat(devChatRequest);
            if (devChatResponseBaseResponse == null) {
                log.error("AI 响应为 null");
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 响应异常");
            }
            
            if (devChatResponseBaseResponse.getCode() != 0) {
                log.error("AI 服务返回错误码: {}, 消息: {}", 
                    devChatResponseBaseResponse.getCode(), 
                    devChatResponseBaseResponse.getMessage());
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, 
                    "AI 服务异常: " + devChatResponseBaseResponse.getMessage());
            }
            
            if (devChatResponseBaseResponse.getData() == null) {
                log.error("AI 响应数据为 null，完整响应: {}", devChatResponseBaseResponse);
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 响应数据为空");
            }
            
            String content = devChatResponseBaseResponse.getData().getContent();
            if (content == null || content.trim().isEmpty()) {
                log.error("AI 返回内容为空");
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 返回内容为空");
            }
            
            return content;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("鱼聪明AI调用过程中发生未预期异常", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 调用失败: " + e.getMessage());
        }
    }

}
