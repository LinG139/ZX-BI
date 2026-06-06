package com.panther.smartBI.manager;

import com.panther.smartBI.ai.*;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.model.entity.AiConfig;
import com.panther.smartBI.service.AiConfigService;
import com.panther.smartBI.service.MonitorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class AiManager {

    @Resource
    private AiConfigService aiConfigService;

    @Resource
    private ZhiPuClient zhiPuClient;

    @Resource
    private QwenClient qwenClient;

    @Resource
    private WenxinClient wenxinClient;

    @Resource
    private OpenAiClient openAiClient;

    @Resource
    private ClaudeClient claudeClient;

    @Resource
    private DeepSeekClient deepSeekClient;

    @Resource
    private GeminiClient geminiClient;

    @Resource
    private XunfeiClient xunfeiClient;

    /**
     * 缓存当前激活的配置和客户端
     */
    private volatile AiConfig currentConfig;
    private volatile AiClient currentClient;
    private final Object lock = new Object();

    /**
     * 获取当前活跃的AI客户端
     */
    private AiClient getCurrentClient() {
        // 双重检查锁定
        if (currentClient == null) {
            synchronized (lock) {
                if (currentClient == null) {
                    refreshClient();
                }
            }
        }
        return currentClient;
    }

    /**
     * 刷新客户端配置（重新从数据库读取）
     */
    public void refreshClient() {
        synchronized (lock) {
            try {
                log.info("开始刷新AI配置...");
                AiConfig config = aiConfigService.getActiveConfig();
                
                if (config == null) {
                    log.error("getActiveConfig() 返回 null");
                    throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI配置为空");
                }
                
                log.info("从数据库获取到AI配置: id={}, platformType={}, platformName={}, chatModel={}, chartModel={}",
                        config.getId(), config.getPlatformType(), config.getPlatformName(),
                        config.getChatModelId(), config.getChartModelId());

                // 配置未变化，不需要刷新
                if (currentConfig != null && config != null && currentConfig.getId().equals(config.getId())) {
                    log.debug("AI配置未变化，跳过刷新");
                    return;
                }

                currentConfig = config;
                log.info("开始创建AI客户端，平台类型: {}", config.getPlatformType());
                currentClient = createClient(config);
                log.info("AI客户端创建成功，当前服务商: {}", config.getPlatformName());
            } catch (BusinessException e) {
                log.error("AI配置业务异常: {}", e.getMessage());
                currentConfig = null;
                currentClient = null;
                throw e;
            } catch (Exception e) {
                log.error("AI配置刷新异常: {}", e.getMessage(), e);
                currentConfig = null;
                currentClient = null;
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI配置初始化失败: " + e.getMessage());
            }
        }
    }

    /**
     * 根据配置创建对应的AI客户端
     */
    private AiClient createClient(AiConfig config) {
        AiClient client;
        String platformType = config.getPlatformType();
        
        if (platformType == null || platformType.trim().isEmpty()) {
            log.error("AI配置的平台类型为空: config={}", config);
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "AI配置的平台类型为空");
        }
        
        log.info("创建AI客户端，platformType={}", platformType);
        
        // 设置配置到对应的客户端
        switch (platformType.toLowerCase()) {
            case "zhipu":
                zhiPuClient.setConfig(config);
                client = zhiPuClient;
                break;
            case "qwen":
                qwenClient.setConfig(config);
                client = qwenClient;
                break;
            case "wenxin":
                wenxinClient.setConfig(config);
                client = wenxinClient;
                break;
            case "baidu":
            case "ernie":
                // 百度文心一言暂时使用OpenAi兼容模式
                openAiClient.setConfig(config);
                client = openAiClient;
                break;
            case "claude":
                claudeClient.setConfig(config);
                client = claudeClient;
                break;
            case "deepseek":
                deepSeekClient.setConfig(config);
                client = deepSeekClient;
                break;
            case "gemini":
                geminiClient.setConfig(config);
                client = geminiClient;
                break;
            case "openai":
                openAiClient.setConfig(config);
                client = openAiClient;
                break;
            case "xunfei":
            case "spark":
                xunfeiClient.setConfig(config);
                client = xunfeiClient;
                break;
            default:
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的AI平台类型: " + platformType);
        }
        
        return client;
    }

    public String doChat(long modelId, String message) {
        return doChat(modelId, message, null);
    }

    public String doChat(long modelId, String message, String prompt) {
        AiClient client = getCurrentClient();
        log.info("使用 {}，模型 ID: {}", currentConfig.getPlatformName(), modelId);
        return doChatInternal(client, message, false, prompt);
    }

    public String doChartAnalysis(long modelId, String message) {
        return doChartAnalysis(modelId, message, null);
    }

    public String doChartAnalysis(long modelId, String message, String prompt) {
        AiClient client = getCurrentClient();
        log.info("使用 {}，模型 ID: {} (图表分析)", currentConfig.getPlatformName(), modelId);
        return doChatInternal(client, message, true, prompt);
    }

    public String doChatByClient(long modelId, String message) {
        return doChatByClient(modelId, message, null);
    }

    public String doChatByClient(long modelId, String message, String prompt) {
        AiClient client = getCurrentClient();
        log.info("使用 {}，模型 ID: {}", currentConfig.getPlatformName(), modelId);
        return doChatInternal(client, message, false, prompt);
    }

    public String doChatWithHistory(long modelId, String message, String prompt, List<ZhiPuClient.Message> history) {
        AiClient client = getCurrentClient();
        log.info("使用 {}，模型 ID: {}, 历史消息数：{}", currentConfig.getPlatformName(), modelId, history.size());
        return doChatWithHistoryInternal(client, message, false, prompt, history);
    }

    private String doChatInternal(AiClient client, String message, boolean isChartAnalysis, String prompt) {
        long startTime = System.currentTimeMillis();
        boolean success = false;
        long tokens = 0;
        try {
            if (client == null) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI客户端未初始化，请检查AI配置");
            }
            String result = client.doChat(message, isChartAnalysis, prompt);
            success = true;
            tokens = (message.length() + (result != null ? result.length() : 0)) / 4;
            return result;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            String platformName = currentConfig != null ? currentConfig.getPlatformName() : "未知平台";
            log.error("{} 调用过程中发生未预期异常", platformName, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 调用失败：" + e.getMessage());
        } finally {
            long responseTime = System.currentTimeMillis() - startTime;
            MonitorService.recordAiCall(success, responseTime, tokens);
        }
    }

    private String doChatWithHistoryInternal(AiClient client, String message, boolean isChartAnalysis, String prompt, List<ZhiPuClient.Message> history) {
        long startTime = System.currentTimeMillis();
        boolean success = false;
        long tokens = 0;
        try {
            if (client == null) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI客户端未初始化，请检查AI配置");
            }
            String result = client.doChatWithHistory(message, isChartAnalysis, prompt, history);
            success = true;
            tokens = (message.length() + (result != null ? result.length() : 0)) / 4;
            return result;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            String platformName = currentConfig != null ? currentConfig.getPlatformName() : "未知平台";
            log.error("{} 调用过程中发生未预期异常", platformName, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 调用失败：" + e.getMessage());
        } finally {
            long responseTime = System.currentTimeMillis() - startTime;
            MonitorService.recordAiCall(success, responseTime, tokens);
        }
    }

    /**
     * 获取当前配置信息（用于测试）
     */
    public AiConfig getCurrentConfig() {
        return currentConfig;
    }
}