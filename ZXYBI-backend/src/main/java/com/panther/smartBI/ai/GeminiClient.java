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
 * Google Gemini客户端
 */
@Service
@Slf4j
public class GeminiClient implements AiClient {

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
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "Gemini配置未初始化");
            }

            String modelId = isChartAnalysis ? config.getChartModelId() : config.getChatModelId();
            String baseUrl = config.getBaseUrl();
            if (baseUrl == null || baseUrl.isEmpty()) {
                baseUrl = "https://generativelanguage.googleapis.com/v1";
            }

            log.info("调用Gemini，模型: {}, 类型: {}, 消息长度: {}",
                    modelId, isChartAnalysis ? "图表分析" : "普通聊天", message.length());

            String url = baseUrl + "/models/" + modelId + ":generateContent";

            Map<String, Object> requestBody = new HashMap<>();

            JSONArray contents = new JSONArray();

            String systemPrompt = isChartAnalysis ? CHART_ANALYSIS_SYSTEM_PROMPT : 
                    (customPrompt != null && !customPrompt.trim().isEmpty() ? customPrompt : null);
            
            if (systemPrompt != null) {
                JSONObject systemContent = new JSONObject();
                systemContent.put("role", "user");
                systemContent.put("parts", new JSONArray().add(new JSONObject().put("text", systemPrompt)));
                contents.add(systemContent);
            }

            for (ZhiPuClient.Message msg : history) {
                JSONObject historyContent = new JSONObject();
                historyContent.put("role", msg.getRole());
                historyContent.put("parts", new JSONArray().add(new JSONObject().put("text", msg.getContent())));
                contents.add(historyContent);
            }

            JSONObject userContent = new JSONObject();
            userContent.put("role", "user");
            userContent.put("parts", new JSONArray().add(new JSONObject().put("text", message)));
            contents.add(userContent);

            requestBody.put("contents", contents);

            requestBody.put("generationConfig", new JSONObject()
                    .put("temperature", config.getTemperature() != null ? config.getTemperature() : 0.7)
                    .put("maxOutputTokens", config.getMaxTokens() != null ? config.getMaxTokens() : 4096));

            String jsonBody = JSONUtil.toJsonStr(requestBody);
            log.debug("Gemini请求体: {}", jsonBody);

            String fullUrl = url + "?key=" + config.getApiKey();

            HttpResponse response = HttpRequest.post(fullUrl)
                    .header("Content-Type", "application/json")
                    .body(jsonBody)
                    .timeout(config.getTimeout() != null ? config.getTimeout() : 180000)
                    .execute();

            int status = response.getStatus();
            if (status != 200) {
                log.error("Gemini调用失败，HTTP状态码: {}, 响应: {}", status, response.body());
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 调用失败，请稍后重试");
            }

            String responseBody = response.body();
            log.debug("Gemini响应: {}", responseBody);

            JSONObject jsonResponse = JSONUtil.parseObj(responseBody);

            if (jsonResponse.containsKey("error")) {
                JSONObject error = jsonResponse.getJSONObject("error");
                String errorMessage = error.getStr("message", "未知错误");
                log.error("Gemini返回错误: {}", errorMessage);
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 返回错误: " + errorMessage);
            }

            JSONArray candidates = jsonResponse.getJSONArray("candidates");
            if (candidates == null || candidates.isEmpty()) {
                log.error("Gemini响应中没有candidates，响应: {}", responseBody);
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 响应异常");
            }

            JSONObject firstCandidate = candidates.getJSONObject(0);
            JSONObject contentObj = firstCandidate.getJSONObject("content");
            if (contentObj == null) {
                log.error("Gemini响应中没有content，响应: {}", responseBody);
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 响应异常");
            }

            JSONArray parts = contentObj.getJSONArray("parts");
            if (parts == null || parts.isEmpty()) {
                log.error("Gemini响应中没有parts，响应: {}", responseBody);
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 响应异常");
            }

            String content = parts.getJSONObject(0).getStr("text");
            if (content == null || content.trim().isEmpty()) {
                log.error("Gemini返回的内容为空，响应: {}", responseBody);
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 返回内容为空");
            }

            log.info("Gemini调用成功，返回内容长度: {}", content.length());
            return content;

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gemini调用过程中发生未预期异常", e);
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "AI 调用失败: " + e.getMessage());
        }
    }
}