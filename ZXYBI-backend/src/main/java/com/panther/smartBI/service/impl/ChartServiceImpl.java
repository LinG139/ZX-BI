package com.panther.smartBI.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.constant.BiConstant;
import com.panther.smartBI.constant.CommonConstant;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.exception.ThrowUtils;
import com.panther.smartBI.manager.AiManager;
import com.panther.smartBI.mapper.ChartMapper;
import com.panther.smartBI.model.dto.chart.ChartQueryRequest;
import com.panther.smartBI.model.dto.chart.GenChartByAiRequest;
import com.panther.smartBI.model.entity.Chart;
import com.panther.smartBI.model.entity.User;
import com.panther.smartBI.model.enums.ChartStatusEnum;
import com.panther.smartBI.model.vo.BiResponse;
import com.panther.smartBI.service.ChartService;
import com.panther.smartBI.service.UserService;
import com.panther.smartBI.utils.SqlUtils;
import com.panther.smartBI.utils.UserInputUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ThreadPoolExecutor;

@Slf4j
@Service("chartService")
public class ChartServiceImpl extends ServiceImpl<ChartMapper, Chart> implements ChartService {

    @Resource
    private UserService userService;

    @Resource
    private AiManager aiManager;

    @Resource
    private ThreadPoolExecutor theadPoolExecutor;

    /**
     * 获取查询包装类
     *
     * @param chartQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<Chart> getQueryWrapper(ChartQueryRequest chartQueryRequest) {
        QueryWrapper<Chart> queryWrapper = new QueryWrapper<>();
        if (chartQueryRequest == null) {
            return queryWrapper;
        }
        Long id = chartQueryRequest.getId();
        String chartType = chartQueryRequest.getChartType();
        String goal = chartQueryRequest.getGoal();
        Long userId = chartQueryRequest.getUserId();
        String sortField = chartQueryRequest.getSortField();
        String sortOrder = chartQueryRequest.getSortOrder();
        String chartName = chartQueryRequest.getName();

        queryWrapper.eq(ObjectUtils.isNotEmpty(id), "userId", id);
        queryWrapper.eq(StringUtils.isNotBlank(goal), "goal", goal);
        queryWrapper.eq(StringUtils.isNotBlank(chartType), "chartType", chartType);
        queryWrapper.eq(userId != null && userId > 0, "userId", userId);
        //queryWrapper.eq("isDelete", 0);
        queryWrapper.like(StringUtils.isNotBlank(chartName), "name", chartName);
        queryWrapper.orderBy(SqlUtils.validSortField(sortField), sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);

        return queryWrapper;
    }

    @Override
    public BiResponse getChartByAi(String csvData, GenChartByAiRequest genChartByAiRequest, HttpServletRequest request) {
        String goal = genChartByAiRequest.getGoal();
        ThrowUtils.throwIf(StringUtils.isBlank(goal), ErrorCode.PARAMS_ERROR, "分析目标为空");
        String chartName = genChartByAiRequest.getName();
        ThrowUtils.throwIf(StringUtils.isBlank(chartName) && chartName.length() > 100, ErrorCode.PARAMS_ERROR, "图表名称为空");
        String chartType = genChartByAiRequest.getChartType();

        User loginUser = userService.getLoginUser(request);
        StringBuilder userInput = new StringBuilder();
        userInput.append("分析需求：").append("\n");
        String userGoal = goal;
        if (StringUtils.isNotBlank(chartType)) {
            userGoal += "，请使用" + chartType;
        }
        userInput.append(userGoal).append("\n");
        userInput.append(goal).append("\n");
        userInput.append("原始数据：").append("\n");
        userInput.append(csvData).append("\n");
        
        String aiRes;
        try {
            aiRes = aiManager.doChartAnalysis(BiConstant.BI_MODEL_ID_S, userInput.toString());
            log.info("AI 原始响应长度: {}", aiRes.length());
            log.debug("AI 原始响应前500字符: {}", aiRes.substring(0, Math.min(500, aiRes.length())));
        } catch (BusinessException e) {
            log.error("AI 调用失败: {}", e.getMessage());
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 分析服务异常，请稍后重试");
        }
        
        final String str = "=>=>=>";
        String[] aiData = aiRes.split(str);
        
        log.info("AI 响应分割后数组长度: {}", aiData.length);
        for (int i = 0; i < aiData.length; i++) {
            String snippet = aiData[i].trim();
            log.debug("AI 响应片段[{}]: {}", i, snippet.substring(0, Math.min(100, snippet.length())));
        }
        
        ThrowUtils.throwIf(aiData.length < 2, ErrorCode.SYSTEM_ERROR, 
            "AI生成结果格式错误，请重试。AI返回内容长度: " + aiRes.length() + 
            ", 分割后片段数: " + aiData.length + 
            ", 响应预览: " + aiRes.substring(0, Math.min(300, aiRes.length())));
        
        log.info("开始解析AI响应 - 第一部分长度: {}, 第二部分长度: {}", 
            aiData[0].length(), aiData[1].length());
        
        String genResult = cleanTextContent(aiData[0]);
        String genChart = extractJsonFromAiResponse(aiData[1]);
        
        if (StringUtils.isBlank(genChart) || StringUtils.isBlank(genResult)) {
            log.error("解析结果为空 - 图表代码长度: {}, 分析结果长度: {}", 
                genChart != null ? genChart.length() : 0, 
                genResult != null ? genResult.length() : 0);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI返回内容解析失败");
        }
        
        log.info("解析成功 - 图表代码长度: {}, 分析结果长度: {}", genChart.length(), genResult.length());
        log.debug("提取的JSON前100字符: {}", genChart.substring(0, Math.min(100, genChart.length())));
        
        boolean b = userService.updateUserChartCount(request);
        ThrowUtils.throwIf(!b,ErrorCode.FORBIDDEN_ERROR,"次数用完请联系管理员！");
        
        Chart chart = new Chart();
        chart.setGoal(goal);
        chart.setName(chartName);
        chart.setChartData(csvData);
        chart.setChartType(chartType);
        chart.setGenChart(genChart);
        chart.setGenResult(genResult);
        chart.setUserId(loginUser.getId());
        chart.setStatus(ChartStatusEnum.CHART_STATUS_SUCCESS.getValue());
        chart.setExecMessage(ChartStatusEnum.CHART_STATUS_SUCCESS.getText());
        ThrowUtils.throwIf(!this.save(chart), ErrorCode.SYSTEM_ERROR, "图表保存失败");
        
        BiResponse biResponse = new BiResponse();
        biResponse.setChartId(chart.getId());
        biResponse.setGenChart(genChart);
        biResponse.setGenResult(genResult);
        return biResponse;
    }

    @Override
    public BiResponse ByAiAsync(String csvData, GenChartByAiRequest genChartByAiRequest, HttpServletRequest request) {
        String goal = genChartByAiRequest.getGoal();
        ThrowUtils.throwIf(StringUtils.isBlank(goal), ErrorCode.PARAMS_ERROR, "分析目标为空");
        String chartName = genChartByAiRequest.getName();
        ThrowUtils.throwIf(StringUtils.isBlank(chartName) && chartName.length() > 100, ErrorCode.PARAMS_ERROR, "图表名称为空");
        String chartType = genChartByAiRequest.getChartType();

        User loginUser = userService.getLoginUser(request);
        StringBuilder userInput = new StringBuilder();
        userInput.append("分析需求：").append("\n");
        String userGoal = goal;
        if (StringUtils.isNotBlank(chartType)) {
            userGoal += "，请使用" + chartType;
        }
        userInput.append(userGoal).append("\n");
        userInput.append(goal).append("\n");
        userInput.append("原始数据：").append("\n");
        userInput.append(csvData).append("\n");
        
        Chart chart = new Chart();
        chart.setGoal(goal);
        chart.setName(chartName);
        chart.setChartData(csvData);
        chart.setChartType(chartType);
        chart.setUserId(loginUser.getId());
        chart.setStatus(ChartStatusEnum.CHART_STATUS_WAITING.getValue());
        chart.setExecMessage(ChartStatusEnum.CHART_STATUS_WAITING.getText());
        ThrowUtils.throwIf(!this.save(chart), ErrorCode.SYSTEM_ERROR, "图表保存失败");
        
        CompletableFuture.runAsync(() -> {
            Chart update = new Chart();
            update.setId(chart.getId());
            update.setStatus(ChartStatusEnum.CHART_STATUS_RUNNING.getValue());
            update.setExecMessage(ChartStatusEnum.CHART_STATUS_RUNNING.getText());
            if (!this.updateById(update)) {
                update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                update.setExecMessage(ChartStatusEnum.CHART_STATUS_FAILURE.getText());
                this.updateById(update);
                return;
            }
            
            try {
                String aiRes = aiManager.doChat(BiConstant.BI_MODEL_ID_S, userInput.toString());
                log.info("异步任务 - AI 原始响应长度: {}", aiRes.length());
                
                final String str = "=>=>=>";
                String[] aiData = aiRes.split(str);
                
                log.info("异步任务 - AI 响应分割后数组长度: {}", aiData.length);
                
                if (aiData.length < 2) {
                    log.error("异步任务 - AI 返回结果格式错误，数据长度: {}, 前200字符: {}", 
                        aiData.length, aiRes.substring(0, Math.min(200, aiRes.length())));
                    update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                    update.setExecMessage("AI 生成结果格式错误");
                    updateById(update);
                    return;
                }
                
                log.info("异步任务 - 开始解析AI响应 - 第一部分长度: {}, 第二部分长度: {}", 
                    aiData[0].length(), aiData[1].length());
                
                String genResult = cleanTextContent(aiData[0]);
                String genChart = extractJsonFromAiResponse(aiData[1]);
                
                if (StringUtils.isBlank(genChart) || StringUtils.isBlank(genResult)) {
                    log.error("异步任务 - AI 返回内容为空");
                    update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                    update.setExecMessage(ChartStatusEnum.CHART_STATUS_FAILURE.getText());
                    updateById(update);
                    return;
                }
                
                log.info("异步任务 - 解析成功，图表代码长度: {}, 分析结果长度: {}", 
                    genChart.length(), genResult.length());
                
                boolean b = userService.updateUserChartCount(request);
                if (!b) {
                    update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                    update.setExecMessage("积分不足");
                    updateById(update);
                    return;
                }
                
                update.setStatus(ChartStatusEnum.CHART_STATUS_SUCCESS.getValue());
                update.setExecMessage(ChartStatusEnum.CHART_STATUS_SUCCESS.getText());
                update.setGenChart(genChart);
                update.setGenResult(genResult);
                this.updateById(update);
                
            } catch (BusinessException e) {
                log.error("异步任务 - AI 调用业务异常: {}", e.getMessage());
                update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                update.setExecMessage("AI 服务异常: " + e.getMessage());
                this.updateById(update);
            } catch (Exception e) {
                log.error("异步任务 - AI 调用未预期异常", e);
                update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                update.setExecMessage("AI 处理失败，请稍后重试");
                this.updateById(update);
            }
        }, theadPoolExecutor);
        
        BiResponse biResponse = new BiResponse();
        biResponse.setChartId(chart.getId());
        return biResponse;
    }

    @Override
    public long saveRawData(String csvData, GenChartByAiRequest genChartByAiRequest, HttpServletRequest request) {

        String name = genChartByAiRequest.getName();
        String goal = genChartByAiRequest.getGoal();
        String chartType = genChartByAiRequest.getChartType();

        User loginUser = userService.getLoginUser(request);
        // 构造用户输入
        StringBuilder userInput = new StringBuilder();
        userInput.append("分析需求：").append("\n");
        // 拼接分析目标
        String userGoal = goal;
        if (StringUtils.isNotBlank(chartType)) {
            userGoal += "，请使用" + chartType;
        }
        userInput.append(userGoal).append("\n");
        userInput.append("原始数据：").append("\n");
        userInput.append(csvData).append("\n");
        // 插入到数据库
        Chart chart = new Chart();
        chart.setName(name);
        chart.setGoal(goal);
        chart.setChartData(csvData);
        chart.setChartType(chartType);
        chart.setStatus(ChartStatusEnum.CHART_STATUS_WAITING.getValue());
        chart.setExecMessage(ChartStatusEnum.CHART_STATUS_WAITING.getText());
        chart.setUserId(loginUser.getId());
        ThrowUtils.throwIf(!this.save(chart), ErrorCode.SYSTEM_ERROR, "图表保存失败");
        return chart.getId();
    }

    @Override
    public List<Long> getFailedChart() {
        return baseMapper.getFailedChart();
    }

    @Override
    public boolean reloadChartByAi(long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id < 0, ErrorCode.PARAMS_ERROR);
        User loginUser = userService.getLoginUser(request);
        CompletableFuture.runAsync(() -> {
            Chart update = new Chart();
            update.setId(id);
            update.setStatus(ChartStatusEnum.CHART_STATUS_RUNNING.getValue());
            update.setExecMessage(ChartStatusEnum.CHART_STATUS_RUNNING.getText());
            if (!this.updateById(update)) {
                update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                update.setExecMessage(ChartStatusEnum.CHART_STATUS_FAILURE.getText());
                this.updateById(update);
                return;
            }
            
            try {
                String userInput = UserInputUtils.BuilderUserInput(id, this);
                String aiRes = aiManager.doChartAnalysis(BiConstant.BI_MODEL_ID_S, userInput.toString());
                log.info("重试任务 - AI 原始响应长度: {}", aiRes.length());
                
                final String str = "=>=>=>";
                String[] aiData = aiRes.split(str);
                
                log.info("重试任务 - AI 响应分割后数组长度: {}", aiData.length);
                
                if (aiData.length < 2) {
                    log.error("重试任务 - AI 返回结果格式错误，数据长度: {}, 前200字符: {}", 
                        aiData.length, aiRes.substring(0, Math.min(200, aiRes.length())));
                    update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                    update.setExecMessage("AI 生成结果格式错误");
                    this.updateById(update);
                    return;
                }
                
                log.info("重试任务 - 开始解析AI响应 - 第一部分长度: {}, 第二部分长度: {}", 
                    aiData[0].length(), aiData[1].length());
                
                String genResult = cleanTextContent(aiData[0]);
                String genChart = extractJsonFromAiResponse(aiData[1]);
                
                if (StringUtils.isBlank(genChart) || StringUtils.isBlank(genResult)) {
                    log.error("重试任务 - AI 返回内容为空");
                    update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                    update.setExecMessage(ChartStatusEnum.CHART_STATUS_FAILURE.getText());
                    updateById(update);
                    return;
                }
                
                log.info("重试任务 - 解析成功，图表代码长度: {}, 分析结果长度: {}", 
                    genChart.length(), genResult.length());
                
                boolean b = userService.updateUserChartCount(request);
                if (!b) {
                    update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                    update.setExecMessage("积分不足");
                    updateById(update);
                    return;
                }
                
                update.setStatus(ChartStatusEnum.CHART_STATUS_SUCCESS.getValue());
                update.setExecMessage(ChartStatusEnum.CHART_STATUS_SUCCESS.getText());
                update.setGenChart(genChart);
                update.setGenResult(genResult);
                this.updateById(update);
                
            } catch (BusinessException e) {
                log.error("重试任务 - AI 调用业务异常: {}", e.getMessage());
                update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                update.setExecMessage("AI 服务异常: " + e.getMessage());
                this.updateById(update);
            } catch (Exception e) {
                log.error("重试任务 - AI 调用未预期异常", e);
                update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                update.setExecMessage("AI 处理失败，请稍后重试");
                this.updateById(update);
            }
        }, theadPoolExecutor);
        return true;
    }

    private String extractJsonFromAiResponse(String content) {
        if (StringUtils.isBlank(content)) {
            return "";
        }
        
        String trimmed = content.trim();
        
        trimmed = trimmed.replaceAll("^【[^】]*】\\s*", "");
        
        int jsonStart = trimmed.indexOf('{');
        int jsonEnd = trimmed.lastIndexOf('}');
        
        if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
            String jsonContent = trimmed.substring(jsonStart, jsonEnd + 1);
            
            jsonContent = jsonContent.replaceAll("<=+>", "").trim();
            
            int cleanJsonStart = jsonContent.indexOf('{');
            int cleanJsonEnd = jsonContent.lastIndexOf('}');
            
            if (cleanJsonStart != -1 && cleanJsonEnd != -1 && cleanJsonEnd > cleanJsonStart) {
                return jsonContent.substring(cleanJsonStart, cleanJsonEnd + 1);
            }
            
            return jsonContent;
        }
        
        return trimmed;
    }

    private String cleanTextContent(String content) {
        if (StringUtils.isBlank(content)) {
            return "";
        }
        
        String trimmed = content.trim();
        
        trimmed = trimmed.replaceAll("^【[^】]*】\\s*", "");
        
        return trimmed;
    }

}

