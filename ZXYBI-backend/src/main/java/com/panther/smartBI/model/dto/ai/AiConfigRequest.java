package com.panther.smartBI.model.dto.ai;

import lombok.Data;

@Data
public class AiConfigRequest {

    /**
     * 平台类型（zhipu/qwen/baidu/claude/deepseek/gemini/openai/xunfei）
     */
    private String platformType;

    /**
     * 平台名称（智谱AI/通义千问/文心一言/Claude/DeepSeek/Gemini/OpenAI/讯飞星火）
     */
    private String platformName;

    /**
     * API密钥
     */
    private String apiKey;

    /**
     * 密钥（部分平台需要）
     */
    private String secret;

    /**
     * 基础URL
     */
    private String baseUrl;

    /**
     * 聊天模型ID
     */
    private String chatModelId;

    /**
     * 图表模型ID
     */
    private String chartModelId;

    /**
     * 超时时间（毫秒）
     */
    private Integer timeout;

    /**
     * 温度参数
     */
    private Double temperature;

    /**
     * topP参数
     */
    private Double topP;

    /**
     * 最大token数
     */
    private Integer maxTokens;

    /**
     * 备注
     */
    private String remark;
}