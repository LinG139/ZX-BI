package com.panther.smartBI.model.enums;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.ObjectUtils;

public enum AiPlatformEnum {

    ZHIPU("智谱AI", "zhipu", "https://open.bigmodel.cn/api/paas/v4"),
    QWEN("通义千问", "qwen", "https://dashscope.aliyuncs.com/api/text-generation/v1"),
    WENXIN("文心一言", "wenxin", "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions"),
    DEEPSEEK("DeepSeek", "deepseek", "https://api.deepseek.com/v1"),
    CLAUDE("Claude", "claude", "https://api.anthropic.com/v1"),
    GEMINI("Gemini", "gemini", "https://generativelanguage.googleapis.com/v1"),
    XUNFEI("讯飞星火", "xunfei", "https://spark-api.xf-yun.com/v3.1/chat"),
    OPENAI("OpenAI", "openai", "https://api.openai.com/v1");

    private final String text;
    private final String value;
    private final String defaultBaseUrl;

    AiPlatformEnum(String text, String value, String defaultBaseUrl) {
        this.text = text;
        this.value = value;
        this.defaultBaseUrl = defaultBaseUrl;
    }

    public static List<String> getValues() {
        return Arrays.stream(values()).map(item -> item.value).collect(Collectors.toList());
    }

    public static AiPlatformEnum getEnumByValue(String value) {
        if (ObjectUtils.isEmpty(value)) {
            return null;
        }
        for (AiPlatformEnum anEnum : AiPlatformEnum.values()) {
            if (anEnum.value.equals(value)) {
                return anEnum;
            }
        }
        return null;
    }

    public String getValue() {
        return value;
    }

    public String getText() {
        return text;
    }

    public String getDefaultBaseUrl() {
        return defaultBaseUrl;
    }
}