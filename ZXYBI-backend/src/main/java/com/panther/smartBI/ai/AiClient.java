package com.panther.smartBI.ai;

import com.panther.smartBI.model.entity.AiConfig;

import java.util.List;

/**
 * AI客户端接口
 */
public interface AiClient {

    /**
     * 执行聊天
     *
     * @param message        用户消息
     * @param isChartAnalysis 是否是图表分析
     * @return 响应内容
     */
    String doChat(String message, boolean isChartAnalysis);

    /**
     * 执行聊天（带自定义提示词）
     *
     * @param message        用户消息
     * @param isChartAnalysis 是否是图表分析
     * @param customPrompt   自定义提示词
     * @return 响应内容
     */
    String doChat(String message, boolean isChartAnalysis, String customPrompt);

    /**
     * 执行聊天（带历史消息）
     *
     * @param message        用户消息
     * @param isChartAnalysis 是否是图表分析
     * @param customPrompt   自定义提示词
     * @param history        历史消息列表
     * @return 响应内容
     */
    String doChatWithHistory(String message, boolean isChartAnalysis, String customPrompt, List<ZhiPuClient.Message> history);

    /**
     * 设置配置
     *
     * @param config AI配置
     */
    void setConfig(AiConfig config);
}