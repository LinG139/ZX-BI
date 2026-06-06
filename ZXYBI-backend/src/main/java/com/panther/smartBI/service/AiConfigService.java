package com.panther.smartBI.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.panther.smartBI.model.entity.AiConfig;

import java.util.List;

public interface AiConfigService extends IService<AiConfig> {

    /**
     * 获取当前启用的AI配置
     */
    AiConfig getActiveConfig();

    /**
     * 获取所有配置列表
     */
    List<AiConfig> getAllConfig();

    /**
     * 添加AI配置
     */
    AiConfig addConfig(AiConfig config);

    /**
     * 更新AI配置
     */
    AiConfig updateConfig(Long id, AiConfig config);

    /**
     * 删除AI配置
     */
    boolean deleteConfig(Long id);

    /**
     * 启用指定配置（会禁用其他配置）
     */
    boolean activateConfig(Long id);

    /**
     * 根据平台类型获取配置
     */
    AiConfig getConfigByPlatform(String platformType);

    /**
     * 根据ID获取配置
     */
    AiConfig getConfigById(Long id);

    /**
     * 保存配置（新增或更新）
     */
    AiConfig saveConfig(AiConfig config);
}