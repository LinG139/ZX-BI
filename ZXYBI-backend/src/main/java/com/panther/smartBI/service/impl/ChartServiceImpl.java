package com.panther.smartBI.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.constant.BiConstant;
import com.panther.smartBI.exception.BusinessException;
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
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 图表服务实现
 *
 * @author Gin 琴酒
 */
@Service
@Slf4j
public class ChartServiceImpl extends ServiceImpl<ChartMapper, Chart> implements ChartService {

    @Resource
    private UserService userService;

    @Resource
    private AiManager aiManager;

    @Resource
    private ThreadPoolExecutor threadPoolExecutor;

    @Override
    public QueryWrapper<Chart> getQueryWrapper(ChartQueryRequest chartQueryRequest) {
        if (chartQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数为空");
        }
        Long id = chartQueryRequest.getId();
        String goal = chartQueryRequest.getGoal();
        String name = chartQueryRequest.getName();
        String chartType = chartQueryRequest.getChartType();
        Long userId = chartQueryRequest.getUserId();
        String sortField = chartQueryRequest.getSortField();
        String sortOrder = chartQueryRequest.getSortOrder();

        QueryWrapper<Chart> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(id != null, "id", id);
        queryWrapper.eq(StringUtils.isNotBlank(goal), "goal", goal);
        queryWrapper.like(StringUtils.isNotBlank(name), "name", name);
        queryWrapper.eq(StringUtils.isNotBlank(chartType), "chartType", chartType);
        queryWrapper.eq(userId != null, "userId", userId);
        queryWrapper.orderBy(StringUtils.isNotBlank(sortField), sortOrder.equals("asc"), sortField);
        return queryWrapper;
    }

    @Override
    public BiResponse getChartByAi(String csvData, GenChartByAiRequest genChartByAiRequest, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }

        String goal = genChartByAiRequest.getGoal();
        String chartType = genChartByAiRequest.getChartType();
        String name = genChartByAiRequest.getName();

        Chart chart = new Chart();
        chart.setGoal(goal);
        chart.setName(name);
        chart.setChartType(chartType);
        chart.setChartData(csvData);
        chart.setUserId(loginUser.getId());
        chart.setStatus(ChartStatusEnum.CHART_STATUS_WAITING.getValue());
        boolean saveResult = this.save(chart);
        if (!saveResult) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "图表保存失败");
        }

        long chartId = chart.getId();

        userService.updateUserChartCount(loginUser.getId());

        String userInput = buildUserInput(goal, chartType, csvData);
        String aiResponse = aiManager.doChartAnalysis(BiConstant.BI_MODEL_ID_S, userInput);

        return parseAndSaveChartResponse(chartId, aiResponse);
    }

    @Override
    public BiResponse ByAiAsync(String csvData, GenChartByAiRequest genChartByAiRequest, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }

        long chartId = saveRawData(csvData, genChartByAiRequest, request);

        String goal = genChartByAiRequest.getGoal();
        String chartType = genChartByAiRequest.getChartType();
        
        threadPoolExecutor.execute(() -> {
            try {
                log.info("开始异步处理图表分析，chartId: {}", chartId);
                String userInput = buildUserInput(goal, chartType, csvData);
                String aiResponse = aiManager.doChartAnalysis(BiConstant.BI_MODEL_ID_S, userInput);
                parseAndSaveChartResponse(chartId, aiResponse);
                log.info("异步图表分析完成，chartId: {}", chartId);
            } catch (Exception e) {
                log.error("异步图表分析失败，chartId: {}", chartId, e);
                Chart update = new Chart();
                update.setId(chartId);
                update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
                update.setExecMessage("异步分析失败: " + e.getMessage());
                updateById(update);
            }
        });

        BiResponse biResponse = new BiResponse();
        biResponse.setChartId(chartId);
        biResponse.setGenStatus(ChartStatusEnum.CHART_STATUS_WAITING.getValue());
        return biResponse;
    }

    @Override
    public long saveRawData(String csvData, GenChartByAiRequest genChartByAiRequest, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }

        String goal = genChartByAiRequest.getGoal();
        String chartType = genChartByAiRequest.getChartType();
        String name = genChartByAiRequest.getName();

        Chart chart = new Chart();
        chart.setGoal(goal);
        chart.setName(name);
        chart.setChartType(chartType);
        chart.setChartData(csvData);
        chart.setUserId(loginUser.getId());
        chart.setStatus(ChartStatusEnum.CHART_STATUS_WAITING.getValue());
        boolean saveResult = this.save(chart);
        if (!saveResult) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "图表数据保存失败");
        }

        userService.updateUserChartCount(loginUser.getId());

        return chart.getId();
    }

    @Override
    public List<Long> getFailedChart() {
        return this.baseMapper.getFailedChart();
    }

    @Override
    public boolean reloadChartByAi(long chartId, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }

        Chart chart = this.getById(chartId);
        if (chart == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "图表不存在");
        }

        if (!chart.getUserId().equals(loginUser.getId()) && !userService.isAdmin(loginUser)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权限重载此图表");
        }

        Chart update = new Chart();
        update.setId(chartId);
        update.setStatus(ChartStatusEnum.CHART_STATUS_RUNNING.getValue());
        update.setExecMessage(ChartStatusEnum.CHART_STATUS_RUNNING.getText());
        boolean updateResult = this.updateById(update);
        if (!updateResult) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "更新图表状态失败");
        }

        String userInput = buildUserInput(chart.getGoal(), chart.getChartType(), chart.getChartData());
        String aiResponse = aiManager.doChartAnalysis(BiConstant.BI_MODEL_ID_S, userInput);

        BiResponse biResponse = parseAndSaveChartResponse(chartId, aiResponse);

        return biResponse.getGenStatus().equals(ChartStatusEnum.CHART_STATUS_SUCCESS.getValue());
    }

    private String buildUserInput(String goal, String chartType, String csvData) {
        StringBuilder userInput = new StringBuilder();
        userInput.append("分析需求：").append("\n");
        String userGoal = goal;
        if (StringUtils.isNotBlank(chartType)) {
            userGoal += "，请使用" + chartType;
        }
        userInput.append(userGoal).append("\n");
        userInput.append("原始数据：").append("\n");
        userInput.append(csvData).append("\n");
        return userInput.toString();
    }

    private BiResponse parseAndSaveChartResponse(long chartId, String aiResponse) {
        BiResponse biResponse = new BiResponse();
        biResponse.setChartId(chartId);

        try {
            if (StringUtils.isBlank(aiResponse)) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "AI 返回内容为空");
            }

            String normalizedResponse = normalizeAiResponse(aiResponse);
            
            String[] aiData = normalizedResponse.split("=>=>=>");
            
            String analysisConclusion = "";
            String genChart = "";
            String genResult = "";

            if (aiData.length == 1) {
                String content = aiData[0].trim();
                if (isValidJson(content)) {
                    genChart = content;
                    genResult = "AI分析完成";
                } else {
                    genResult = content;
                    genChart = "{}";
                }
            } else if (aiData.length == 2) {
                analysisConclusion = aiData[0].trim();
                if (isValidJson(aiData[1].trim())) {
                    genChart = aiData[1].trim();
                    genResult = analysisConclusion;
                } else {
                    genResult = aiData[1].trim();
                    genChart = "{}";
                }
            } else if (aiData.length >= 3) {
                analysisConclusion = aiData[0].trim();
                genChart = aiData[1].trim();
                genResult = aiData[2].trim();
                
                for (int i = 3; i < aiData.length; i++) {
                    genResult += " =>=>=> " + aiData[i].trim();
                }
            }

            if (StringUtils.isBlank(genChart)) {
                genChart = "{}";
            }
            
            if (StringUtils.isBlank(genResult)) {
                genResult = analysisConclusion.isEmpty() ? "AI分析完成" : analysisConclusion;
            }

            if (!isValidJson(genChart)) {
                log.warn("AI返回的图表JSON格式无效，使用空对象: {}", genChart);
                genChart = "{}";
            }
            
            genChart = cleanJsonWithFunctions(genChart);

            Chart update = new Chart();
            update.setId(chartId);
            update.setGenChart(genChart);
            update.setGenResult(genResult);
            update.setStatus(ChartStatusEnum.CHART_STATUS_SUCCESS.getValue());
            update.setExecMessage(ChartStatusEnum.CHART_STATUS_SUCCESS.getText());
            this.updateById(update);

            biResponse.setGenChart(genChart);
            biResponse.setGenResult(genResult);
            biResponse.setGenStatus(ChartStatusEnum.CHART_STATUS_SUCCESS.getValue());
            biResponse.setExecMessage(ChartStatusEnum.CHART_STATUS_SUCCESS.getText());
        } catch (BusinessException e) {
            log.error("AI解析失败: {}", e.getMessage());
            Chart update = new Chart();
            update.setId(chartId);
            update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
            update.setExecMessage(e.getMessage());
            this.updateById(update);

            biResponse.setGenStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
            biResponse.setExecMessage(e.getMessage());
        } catch (Exception e) {
            log.error("AI解析过程中发生未知异常", e);
            Chart update = new Chart();
            update.setId(chartId);
            update.setStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
            update.setExecMessage("AI 解析异常: " + e.getMessage());
            this.updateById(update);

            biResponse.setGenStatus(ChartStatusEnum.CHART_STATUS_FAILURE.getValue());
            biResponse.setExecMessage("AI 解析异常: " + e.getMessage());
        }

        return biResponse;
    }

    private String normalizeAiResponse(String response) {
        String normalized = response.trim();
        
        if (normalized.startsWith("```json")) {
            normalized = normalized.substring(7);
        } else if (normalized.startsWith("```")) {
            normalized = normalized.substring(3);
        }
        
        if (normalized.endsWith("```")) {
            normalized = normalized.substring(0, normalized.length() - 3);
        }
        
        normalized = normalized.replaceAll("\\r\\n", "\n").trim();
        
        return normalized;
    }

    private boolean isValidJson(String json) {
        if (StringUtils.isBlank(json)) {
            return false;
        }
        String trimmed = json.trim();
        return (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
               (trimmed.startsWith("[") && trimmed.endsWith("]"));
    }

    private String cleanJsonWithFunctions(String json) {
        if (StringUtils.isBlank(json)) {
            return json;
        }
        String cleaned = json;
        cleaned = cleaned.replaceAll("\"formatter\"\\s*:\\s*function\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}", "\"formatter\": \"\"");
        cleaned = cleaned.replaceAll("\"emphasis\"\\s*:\\s*\\{[\\s\\S]*?\\}", "\"emphasis\": {}");
        cleaned = cleaned.replaceAll("\"formatter\"\\s*:\\s*\"[^\"]*\"", "\"formatter\": \"\"");
        return cleaned;
    }
}
