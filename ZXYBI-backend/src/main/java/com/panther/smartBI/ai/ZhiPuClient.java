package com.panther.smartBI.ai;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.panther.smartBI.common.BaseResponse;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.config.ZhiPuConfig;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.model.chat.DevChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class ZhiPuClient {

    @Resource
    private ZhiPuConfig zhiPuConfig;

    private static final String CHART_ANALYSIS_SYSTEM_PROMPT =
            "你是一个数据分析和可视化专家。请严格按照以下两部分格式返回结果，绝对不能颠倒顺序:\n\n" +
                    "第一部分：简要的数据分析结论\n" +
                    "=>=>=>\n" +
                    "第二部分：只返回纯ECharts option配置JSON代码，不能包含任何其他内容\n\n" +

                    "正确输出示例:\n" +
                    "这是数据分析结论...\n" +
                    "=>=>=>\n" +
                    "{\"title\":{...}, \"xAxis\": {...}, ...}\n\n" +

                    "严格要求:\n" +
                    "1. 必须在数据分析结论后单独一行使用 '=>=>=>' 作为分隔符，这是强制要求\n" +
                    "2. 分隔符之后只能有纯JSON代码，不能有任何额外文字、分析、注释或代码块标记\n" +
                    "3. JSON必须是标准可解析格式，不能包含中文注释\n" +
                    "4. 不要在JSON前后添加任何 ```json 或其他标记，分隔符之后直接就是JSON\n" +
                    "5. 确保JSON可以被JSON.parse()直接解析";

    public String doChat(String message, boolean isChartAnalysis) {
        try {
            String modelId = isChartAnalysis ?
                    zhiPuConfig.getChartModelId() :
                    zhiPuConfig.getChatModelId();

            log.info("调用智谱AI，模型: {}, 类型: {}, 消息长度: {}",
                    modelId, isChartAnalysis ? "图表分析" : "普通聊天", message.length());

            String url = zhiPuConfig.getBaseUrl() + "/chat/completions";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelId);

            JSONArray messages = new JSONArray();

            if (isChartAnalysis) {
                JSONObject systemMessage = new JSONObject();
                systemMessage.put("role", "system");
                systemMessage.put("content", CHART_ANALYSIS_SYSTEM_PROMPT);
                messages.add(systemMessage);
                log.debug("添加图表分析系统提示词，使用模型: {}", modelId);
            }

            JSONObject userMessage = new JSONObject();
            userMessage.put("role", "user");
            userMessage.put("content", message);
            messages.add(userMessage);

            requestBody.put("messages", messages);
            requestBody.put("stream", false);
            requestBody.put("temperature", 0.95);
            requestBody.put("top_p", 0.7);

            String jsonBody = JSONUtil.toJsonStr(requestBody);

            log.debug("智谱AI请求体: {}", jsonBody);

            HttpResponse response = HttpRequest.post(url)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + zhiPuConfig.getApiKey())
                    .body(jsonBody)
                    .timeout(60000)
                    .execute();

            int statusCode = response.getStatus();
            String responseBody = response.body();

            log.info("智谱AI HTTP 状态码: {}, 响应长度: {}", statusCode, responseBody != null ? responseBody.length() : 0);

            if (statusCode != 200) {
                log.error("智谱AI请求失败，状态码: {}, 响应: {}", statusCode, responseBody);
                throw new BusinessException(ErrorCode.SYSTEM_ERROR,
                        "AI 服务异常，HTTP状态码: " + statusCode);
            }

            if (responseBody == null || responseBody.trim().isEmpty()) {
                log.error("智谱AI返回空响应");
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 服务返回空响应");
            }

            JSONObject jsonResponse = JSONUtil.parseObj(responseBody);

            if (!jsonResponse.containsKey("choices") || jsonResponse.getJSONArray("choices").isEmpty()) {
                log.error("智谱AI返回数据格式异常: {}", responseBody);
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 返回数据格式异常");
            }

            JSONArray choices = jsonResponse.getJSONArray("choices");
            JSONObject firstChoice = choices.getJSONObject(0);
            JSONObject messageObj = firstChoice.getJSONObject("message");
            String content = messageObj.getStr("content");

            if (content == null || content.trim().isEmpty()) {
                log.error("智谱AI返回空内容");
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 返回内容为空");
            }

            log.info("智谱AI调用成功，响应长度: {}", content.length());
            log.debug("智谱AI完整响应: {}", content);

            return content;

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("智谱AI调用异常", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 服务调用失败: " + e.getMessage());
        }
    }

    public BaseResponse<DevChatResponse> doChatWithResponse(String message, boolean isChartAnalysis) {
        try {
            String content = doChat(message, isChartAnalysis);

            DevChatResponse devChatResponse = new DevChatResponse();
            devChatResponse.setContent(content);

            BaseResponse<DevChatResponse> response = new BaseResponse<>();
            response.setCode(0);
            response.setMessage("success");
            response.setData(devChatResponse);

            return response;
        } catch (BusinessException e) {
            BaseResponse<DevChatResponse> errorResponse = new BaseResponse<>();
            errorResponse.setCode(e.getCode());
            errorResponse.setMessage(e.getMessage());
            return errorResponse;
        } catch (Exception e) {
            log.error("智谱AI调用异常", e);
            BaseResponse<DevChatResponse> errorResponse = new BaseResponse<>();
            errorResponse.setCode(500);
            errorResponse.setMessage("AI 服务调用异常: " + e.getMessage());
            return errorResponse;
        }
    }
}
