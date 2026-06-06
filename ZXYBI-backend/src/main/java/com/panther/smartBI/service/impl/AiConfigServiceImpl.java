package com.panther.smartBI.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.mapper.AiConfigMapper;
import com.panther.smartBI.model.entity.AiConfig;
import com.panther.smartBI.service.AiConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Slf4j
public class AiConfigServiceImpl extends ServiceImpl<AiConfigMapper, AiConfig> implements AiConfigService {

    @Override
    public AiConfig getActiveConfig() {
        List<AiConfig> list = baseMapper.selectActiveConfig();
        if (list == null || list.isEmpty()) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "未配置AI服务");
        }
        return list.get(0);
    }

    @Override
    public List<AiConfig> getAllConfig() {
        LambdaQueryWrapper<AiConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AiConfig::getIsDelete, 0);
        wrapper.orderByDesc(AiConfig::getUpdateTime);
        return baseMapper.selectList(wrapper);
    }

    @Override
    @Transactional
    public AiConfig addConfig(AiConfig config) {
        validateConfig(config);
        
        // 检查平台类型是否已存在
        AiConfig existing = baseMapper.selectByPlatformType(config.getPlatformType());
        if (existing != null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "该平台类型已存在");
        }
        
        config.setIsDelete(0);
        config.setIsActive(0); // 默认禁用
        baseMapper.insert(config);
        log.info("添加AI配置: {}", config.getPlatformName());
        return config;
    }

    @Override
    @Transactional
    public AiConfig updateConfig(Long id, AiConfig config) {
        AiConfig existing = baseMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "配置不存在");
        }

        // 更新字段
        if (StringUtils.hasText(config.getPlatformName())) {
            existing.setPlatformName(config.getPlatformName());
        }
        if (StringUtils.hasText(config.getApiKey())) {
            existing.setApiKey(config.getApiKey());
        }
        if (StringUtils.hasText(config.getSecret())) {
            existing.setSecret(config.getSecret());
        }
        if (StringUtils.hasText(config.getBaseUrl())) {
            existing.setBaseUrl(config.getBaseUrl());
        }
        if (StringUtils.hasText(config.getChatModelId())) {
            existing.setChatModelId(config.getChatModelId());
        }
        if (StringUtils.hasText(config.getChartModelId())) {
            existing.setChartModelId(config.getChartModelId());
        }
        if (config.getTimeout() != null) {
            existing.setTimeout(config.getTimeout());
        }
        if (config.getTemperature() != null) {
            existing.setTemperature(config.getTemperature());
        }
        if (config.getTopP() != null) {
            existing.setTopP(config.getTopP());
        }
        if (config.getMaxTokens() != null) {
            existing.setMaxTokens(config.getMaxTokens());
        }
        if (StringUtils.hasText(config.getRemark())) {
            existing.setRemark(config.getRemark());
        }

        baseMapper.updateById(existing);
        log.info("更新AI配置: {}", existing.getPlatformName());
        return existing;
    }

    @Override
    @Transactional
    public boolean deleteConfig(Long id) {
        AiConfig config = baseMapper.selectById(id);
        if (config == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "配置不存在");
        }
        
        if (config.getIsActive() == 1) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "不能删除正在使用的配置");
        }
        
        baseMapper.deleteById(id);
        log.info("删除AI配置: {}", config.getPlatformName());
        return true;
    }

    @Override
    @Transactional
    public boolean activateConfig(Long id) {
        AiConfig config = baseMapper.selectById(id);
        if (config == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "配置不存在");
        }

        // 禁用所有其他配置
        LambdaQueryWrapper<AiConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AiConfig::getIsActive, 1);
        wrapper.eq(AiConfig::getIsDelete, 0);
        List<AiConfig> activeList = baseMapper.selectList(wrapper);
        for (AiConfig active : activeList) {
            active.setIsActive(0);
            baseMapper.updateById(active);
            log.info("禁用AI配置: {}", active.getPlatformName());
        }

        // 启用当前配置
        config.setIsActive(1);
        baseMapper.updateById(config);
        log.info("启用AI配置: {}", config.getPlatformName());
        return true;
    }

    @Override
    public AiConfig getConfigByPlatform(String platformType) {
        return baseMapper.selectByPlatformType(platformType);
    }

    @Override
    public AiConfig getConfigById(Long id) {
        AiConfig config = baseMapper.selectById(id);
        if (config == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "配置不存在");
        }
        return config;
    }

    @Override
    @Transactional
    public AiConfig saveConfig(AiConfig config) {
        validateConfig(config);
        
        if (config.getId() != null) {
            // 更新操作
            return updateConfig(config.getId(), config);
        } else {
            // 新增操作
            return addConfig(config);
        }
    }

    private void validateConfig(AiConfig config) {
        if (!StringUtils.hasText(config.getPlatformType())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "平台类型不能为空");
        }
        if (!StringUtils.hasText(config.getPlatformName())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "平台名称不能为空");
        }
        if (!StringUtils.hasText(config.getApiKey())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "API密钥不能为空");
        }
        // baseUrl 允许为空（使用默认值）
    }
}