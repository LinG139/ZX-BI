package com.panther.smartBI.ai;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.model.entity.AiConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 通义千问客户端
 */
@Service
@Slf4j
public class QwenClient implements AiClient {

    private AiConfig config;

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
                    "4. 不要在JSON前后添加任何 ``` json 或其他标记，分隔符之后直接就是JSON\n" +
                    "5. 确保JSON可以被JSON.parse()直接解析\n" +
                    "6. 绝对禁止在JSON中使用JavaScript函数，所有动态内容必须使用字符串模板，例如：\n" +
                    "   - 正确：\"formatter\": \"{b}: {c}\" 或 \"formatter\": \"{a} <br/>{b}: {c}\"\n" +
                    "   - 错误：\"formatter\": function(params) { return ...; }\n" +
                    "   - 正确：\"textStyle\": {\"fontSize\": 14} 而不是 \"textStyle\": function() {...}\n" +
                    "7. 所有支持模板字符串的属性都必须使用 {xxx} 占位符格式，不要使用函数";

    @Override
    public void setConfig(AiConfig config) {
        this.config = config;
        log.info("通义千问配置已更新: platformName={}, chatModel={}, chartModel={}, baseUrl={}",
                config.getPlatformName(), config.getChatModelId(), config.getChartModelId(),
                config.getBaseUrl());
    }

    @Override
    public String doChat(String message, boolean isChartAnalysis) {
        return doChat(message, isChartAnalysis, null);
    }

    @Override
    public String doChat(String message, boolean isChartAnalysis, String customPrompt) {
        return doChatWithHistory(message, isChartAnalysis, customPrompt, new ArrayList<>());
    }

    @Override
    public String doChatWithHistory(String message, boolean isChartAnalysis, String customPrompt, List<ZhiPuClient.Message> history) {
        try {
            if (config == null) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "通义千问配置未初始化");
            }

            String modelId = isChartAnalysis ? config.getChartModelId() : config.getChatModelId();
            String baseUrl = config.getBaseUrl();
            if (baseUrl == null || baseUrl.isEmpty()) {
                baseUrl = "https://dashscope.aliyuncs.com/api/text-generation/v1";
            }

            log.info("调用通义千问，模型: {}, 类型: {}, 消息长度: {}, 历史消息数: {}, URL: {}",
                    modelId, isChartAnalysis ? "图表分析" : "普通聊天", message.length(), history.size(), baseUrl);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelId);

            JSONArray messages = new JSONArray();

            if (isChartAnalysis) {
                JSONObject systemMessage = new JSONObject();
                systemMessage.put("role", "system");
                systemMessage.put("content", CHART_ANALYSIS_SYSTEM_PROMPT);
                messages.add(systemMessage);
            } else if (customPrompt != null && !customPrompt.trim().isEmpty()) {
                JSONObject systemMessage = new JSONObject();
                systemMessage.put("role", "system");
                systemMessage.put("content", customPrompt);
                messages.add(systemMessage);
            }

            for (ZhiPuClient.Message msg : history) {
                JSONObject historyMessage = new JSONObject();
                historyMessage.put("role", msg.getRole());
                historyMessage.put("content", msg.getContent());
                messages.add(historyMessage);
            }

            JSONObject userMessage = new JSONObject();
            userMessage.put("role", "user");
            userMessage.put("content", message);
            messages.add(userMessage);

            requestBody.put("input", new JSONObject().put("messages", messages));
            requestBody.put("parameters", new JSONObject()
                    .put("temperature", config.getTemperature() != null ? config.getTemperature() : 0.7)
                    .put("max_tokens", config.getMaxTokens() != null ? config.getMaxTokens() : 4096));

            String jsonBody = JSONUtil.toJsonStr(requestBody);
            log.debug("通义千问请求体: {}", jsonBody);

            HttpResponse response = HttpRequest.post(baseUrl)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + config.getApiKey())
                    .body(jsonBody)
                    .timeout(config.getTimeout() != null ? config.getTimeout() : 180000)
                    .execute();

            int status = response.getStatus();
            if (status != 200) {
                log.error("通义千问调用失败，HTTP状态码: {}, 响应: {}", status, response.body());
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 调用失败，请稍后重试");
            }

            String responseBody = response.body();
            log.debug("通义千问响应: {}", responseBody);

            JSONObject jsonResponse = JSONUtil.parseObj(responseBody);

            if (jsonResponse.containsKey("error")) {
                JSONObject error = jsonResponse.getJSONObject("error");
                String errorMessage = error.getStr("message", "未知错误");
                log.error("通义千问返回错误: {}", errorMessage);
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 返回错误: " + errorMessage);
            }

            JSONObject output = jsonResponse.getJSONObject("output");
            if (output == null) {
                log.error("通义千问响应中没有output字段");
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 响应异常");
            }

            String content = output.getStr("text");
            if (content == null || content.trim().isEmpty()) {
                log.error("通义千问返回的内容为空");
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 返回内容为空");
            }

            log.info("通义千问调用成功，返回内容长度: {}", content.length());
            return content;

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("通义千问调用过程中发生未预期异常", e);
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 调用失败: " + e.getMessage());
        }
    }
}