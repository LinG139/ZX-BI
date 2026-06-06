package com.panther.smartBI.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
@TableName("ai_config")
public class AiConfig implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 平台类型（zhipu/qwen/baidu/claude/deepseek/gemini/openai/xunfei）
     */
    @TableField("platform_type")
    private String platformType;

    /**
     * 平台名称（智谱AI/通义千问/文心一言/Claude/DeepSeek/Gemini/OpenAI/讯飞星火）
     */
    @TableField("platform_name")
    private String platformName;

    /**
     * API密钥
     */
    @TableField("api_key")
    private String apiKey;

    /**
     * 密钥（部分平台需要）
     */
    private String secret;

    /**
     * 基础URL
     */
    @TableField("base_url")
    private String baseUrl;

    /**
     * 聊天模型ID
     */
    @TableField("chat_model_id")
    private String chatModelId;

    /**
     * 图表模型ID
     */
    @TableField("chart_model_id")
    private String chartModelId;

    /**
     * 是否启用（0-禁用，1-启用）
     */
    @TableField("is_active")
    private Integer isActive;

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
    @TableField("top_p")
    private Double topP;

    /**
     * 最大token数
     */
    @TableField("max_tokens")
    private Integer maxTokens;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    private Date updateTime;

    /**
     * 是否删除
     */
    @TableField("is_delete")
    @TableLogic
    private Integer isDelete;
}