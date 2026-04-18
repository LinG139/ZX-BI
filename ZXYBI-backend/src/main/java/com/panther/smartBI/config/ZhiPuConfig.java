package com.panther.smartBI.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "zhipuai")
public class ZhiPuConfig {
    
    private String apiKey;
    
    private String chartModelId;
    
    private String chatModelId;
    
    private String baseUrl;
}
