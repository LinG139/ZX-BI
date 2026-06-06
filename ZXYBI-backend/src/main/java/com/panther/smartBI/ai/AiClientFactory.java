package com.panther.smartBI.ai;

import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.model.entity.AiConfig;
import com.panther.smartBI.model.enums.AiPlatformEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class AiClientFactory {

    @Resource
    private ZhiPuClient zhiPuClient;

    @Resource
    private QwenClient qwenClient;

    @Resource
    private WenxinClient wenxinClient;

    @Resource
    private DeepSeekClient deepSeekClient;

    private final Map<String, AiClient> clientMap = new ConcurrentHashMap<>();

    public AiClient getClient(AiConfig config) {
        if (config == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "AI配置不能为空");
        }

        String platformType = config.getPlatformType();
        AiClient client = clientMap.get(platformType);

        if (client == null) {
            client = createClient(platformType);
            clientMap.put(platformType, client);
        }

        client.setConfig(config);
        return client;
    }

    public AiClient getClient(String platformType) {
        AiClient client = clientMap.get(platformType);
        
        if (client == null) {
            client = createClient(platformType);
            clientMap.put(platformType, client);
        }
        
        return client;
    }

    private AiClient createClient(String platformType) {
        AiPlatformEnum platformEnum = AiPlatformEnum.getEnumByValue(platformType);
        
        if (platformEnum == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的AI平台: " + platformType);
        }

        switch (platformEnum) {
            case ZHIPU:
                log.info("创建智谱AI客户端");
                return zhiPuClient;
            case QWEN:
                log.info("创建通义千问客户端");
                return qwenClient;
            case WENXIN:
                log.info("创建文心一言客户端");
                return wenxinClient;
            case DEEPSEEK:
                log.info("创建DeepSeek客户端");
                return deepSeekClient;
           
            default:
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "不支持的AI平台: " + platformType);
        }
    }
}