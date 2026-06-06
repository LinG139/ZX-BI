package com.panther.smartBI.controller;

import com.panther.smartBI.annotation.AuthCheck;
import com.panther.smartBI.common.BaseResponse;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.common.ResultUtils;
import com.panther.smartBI.constant.UserConstant;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.manager.AiManager;
import com.panther.smartBI.model.dto.ai.AiConfigRequest;
import com.panther.smartBI.model.entity.AiConfig;
import com.panther.smartBI.model.enums.AiPlatformEnum;
import com.panther.smartBI.service.AiConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/ai-config")
@Slf4j
public class AiConfigController {

    @Resource
    private AiConfigService aiConfigService;

    @Resource
    private AiManager aiManager;

    /**
     * 获取支持的AI平台列表（管理员）
     */
    @GetMapping("/platforms")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<List<Map<String, String>>> getPlatforms() {
        List<Map<String, String>> platforms = new ArrayList<>();
        for (AiPlatformEnum platform : AiPlatformEnum.values()) {
            Map<String, String> map = new HashMap<>();
            map.put("value", platform.getValue());
            map.put("label", platform.getText());
            map.put("defaultUrl", platform.getDefaultBaseUrl());
            platforms.add(map);
        }
        return ResultUtils.success(platforms);
    }

    /**
     * 获取所有AI配置列表（管理员）
     */
    @GetMapping("/list")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<List<AiConfig>> listAllConfig() {
        List<AiConfig> list = aiConfigService.getAllConfig();
        return ResultUtils.success(list);
    }

    /**
     * 获取当前启用的配置
     */
    @GetMapping("/active")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<AiConfig> getActiveConfig() {
        try {
            AiConfig config = aiConfigService.getActiveConfig();
            return ResultUtils.success(config);
        } catch (BusinessException e) {
            // 没有激活配置时返回 null 而不是抛出异常
            return ResultUtils.success(null);
        }
    }

    /**
     * 添加AI配置（管理员）
     */
    @PostMapping("/add")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<AiConfig> addConfig(@RequestBody AiConfigRequest request) {
        AiConfig config = new AiConfig();
        config.setPlatformType(request.getPlatformType());
        config.setPlatformName(request.getPlatformName());
        config.setApiKey(request.getApiKey());
        config.setSecret(request.getSecret());
        config.setBaseUrl(request.getBaseUrl());
        config.setChatModelId(request.getChatModelId());
        config.setChartModelId(request.getChartModelId());
        config.setIsActive(0);
        config.setTimeout(request.getTimeout() != null ? request.getTimeout() : 30000);
        config.setTemperature(request.getTemperature() != null ? request.getTemperature() : 0.7);
        config.setTopP(request.getTopP() != null ? request.getTopP() : 0.9);
        config.setMaxTokens(request.getMaxTokens() != null ? request.getMaxTokens() : 4096);
        config.setRemark(request.getRemark());
        
        AiConfig result = aiConfigService.addConfig(config);
        return ResultUtils.success(result);
    }

    /**
     * 更新AI配置（管理员）
     */
    @PutMapping("/{id}")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<AiConfig> updateConfig(@PathVariable Long id, @RequestBody AiConfigRequest request) {
        AiConfig config = new AiConfig();
        config.setPlatformName(request.getPlatformName());
        config.setApiKey(request.getApiKey());
        config.setSecret(request.getSecret());
        config.setBaseUrl(request.getBaseUrl());
        config.setChatModelId(request.getChatModelId());
        config.setChartModelId(request.getChartModelId());
        config.setTimeout(request.getTimeout());
        config.setTemperature(request.getTemperature());
        config.setTopP(request.getTopP());
        config.setMaxTokens(request.getMaxTokens());
        config.setRemark(request.getRemark());
        
        AiConfig result = aiConfigService.updateConfig(id, config);
        return ResultUtils.success(result);
    }

    /**
     * 删除AI配置（管理员）
     */
    @DeleteMapping("/{id}")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteConfig(@PathVariable Long id) {
        boolean result = aiConfigService.deleteConfig(id);
        return ResultUtils.success(result);
    }

    /**
     * 启用指定配置（管理员）
     */
    @PostMapping("/{id}/activate")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> activateConfig(@PathVariable Long id) {
        boolean result = aiConfigService.activateConfig(id);
        return ResultUtils.success(result);
    }

    /**
     * 根据平台类型获取配置
     */
    @GetMapping("/platform/{platformType}")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<AiConfig> getConfigByPlatform(@PathVariable String platformType) {
        AiConfig config = aiConfigService.getConfigByPlatform(platformType);
        return ResultUtils.success(config);
    }

    /**
     * 测试AI配置（管理员）
     */
    @PostMapping("/test/{id}")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Map<String, Object>> testConfig(@PathVariable Long id) {
        AiConfig config = aiConfigService.getById(id);
        if (config == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "配置不存在");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("configId", id);
        result.put("platformName", config.getPlatformName());
        result.put("platformType", config.getPlatformType());

        try {
            // 临时设置配置到AiManager进行测试
            aiManager.refreshClient();
            
            // 使用简单的测试消息
            String testMessage = "你好，这是一个测试消息，请回复'测试成功'";
            String response = aiManager.doChat(1L, testMessage);
            
            result.put("success", true);
            result.put("response", response);
            result.put("message", "AI配置测试成功");
            log.info("AI配置测试成功: {}", config.getPlatformName());
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("message", "AI配置测试失败: " + e.getMessage());
            log.error("AI配置测试失败: {}", config.getPlatformName(), e);
        }

        return ResultUtils.success(result);
    }

    /**
     * 测试图表分析功能（管理员）
     */
    @PostMapping("/test-chart/{id}")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Map<String, Object>> testChartAnalysis(@PathVariable Long id) {
        AiConfig config = aiConfigService.getById(id);
        if (config == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "配置不存在");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("configId", id);
        result.put("platformName", config.getPlatformName());
        result.put("platformType", config.getPlatformType());

        try {
            // 临时激活配置
            aiConfigService.activateConfig(id);
            aiManager.refreshClient();
            
            // 使用简单的测试数据进行图表分析
            String testData = "日期,销售额\n2024-01-01,100\n2024-01-02,150\n2024-01-03,200";
            String testGoal = "分析销售趋势，生成折线图";
            String userInput = "分析需求：\n" + testGoal + "\n原始数据：\n" + testData;
            
            String response = aiManager.doChartAnalysis(1L, userInput);
            
            result.put("success", true);
            result.put("response", response);
            result.put("message", "图表分析测试成功");
            log.info("图表分析测试成功: {}", config.getPlatformName());
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("message", "图表分析测试失败: " + e.getMessage());
            log.error("图表分析测试失败: {}", config.getPlatformName(), e);
        }

        return ResultUtils.success(result);
    }

    /**
     * 刷新AI配置（管理员）
     */
    @PostMapping("/refresh")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> refreshConfig() {
        try {
            aiManager.refreshClient();
            AiConfig currentConfig = aiManager.getCurrentConfig();
            log.info("AI配置已手动刷新，当前服务商: {}", currentConfig.getPlatformName());
            return ResultUtils.success(true);
        } catch (Exception e) {
            log.error("刷新AI配置失败", e);
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "刷新配置失败: " + e.getMessage());
        }
    }

    /**
     * 获取当前激活的配置信息（管理员）
     */
    @GetMapping("/current")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<AiConfig> getCurrentConfig() {
        AiConfig config = aiManager.getCurrentConfig();
        return ResultUtils.success(config);
    }
}