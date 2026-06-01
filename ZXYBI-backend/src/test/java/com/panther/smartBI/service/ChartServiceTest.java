package com.panther.smartBI.service;

import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.manager.AiManager;
import com.panther.smartBI.mapper.ChartMapper;
import com.panther.smartBI.model.dto.chart.ChartQueryRequest;
import com.panther.smartBI.model.dto.chart.GenChartByAiRequest;
import com.panther.smartBI.model.entity.Chart;
import com.panther.smartBI.model.entity.User;
import com.panther.smartBI.model.enums.ChartStatusEnum;
import com.panther.smartBI.model.vo.BiResponse;
import com.panther.smartBI.service.impl.ChartServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadPoolExecutor;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 图表服务测试类
 */
public class ChartServiceTest {

    @Mock
    private ChartMapper chartMapper;

    @Mock
    private UserService userService;

    @Mock
    private AiManager aiManager;

    @Mock
    private ThreadPoolExecutor threadPoolExecutor;

    @Mock
    private HttpServletRequest request;

    private ChartServiceImpl chartService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        chartService = new ChartServiceImpl();
        
        try {
            java.lang.reflect.Field mapperField = ChartServiceImpl.class.getSuperclass().getDeclaredField("baseMapper");
            mapperField.setAccessible(true);
            mapperField.set(chartService, chartMapper);
            
            java.lang.reflect.Field userServiceField = ChartServiceImpl.class.getDeclaredField("userService");
            userServiceField.setAccessible(true);
            userServiceField.set(chartService, userService);
            
            java.lang.reflect.Field aiManagerField = ChartServiceImpl.class.getDeclaredField("aiManager");
            aiManagerField.setAccessible(true);
            aiManagerField.set(chartService, aiManager);
            
            java.lang.reflect.Field executorField = ChartServiceImpl.class.getDeclaredField("threadPoolExecutor");
            executorField.setAccessible(true);
            executorField.set(chartService, threadPoolExecutor);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    void testGetQueryWrapper_NormalCase() {
        ChartQueryRequest request = new ChartQueryRequest();
        request.setId(1L);
        request.setGoal("test goal");
        request.setName("test name");
        request.setChartType("柱状图");
        request.setUserId(1L);
        request.setSortField("createTime");
        request.setSortOrder("asc");

        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Chart> wrapper = chartService.getQueryWrapper(request);
        
        Assertions.assertNotNull(wrapper);
    }

    @Test
    void testGetQueryWrapper_NullRequest() {
        Assertions.assertThrows(BusinessException.class, () -> {
            chartService.getQueryWrapper(null);
        });
    }

    @Test
    void testSaveRawData_Success() {
        User mockUser = new User();
        mockUser.setId(1L);

        GenChartByAiRequest genRequest = new GenChartByAiRequest();
        genRequest.setGoal("分析数据");
        genRequest.setChartType("柱状图");
        genRequest.setName("测试图表");

        when(userService.getLoginUser(any())).thenReturn(mockUser);
        when(chartMapper.insert(any())).thenReturn(1);
        doNothing().when(userService).updateUserChartCount(anyLong());

        long result = chartService.saveRawData("csv data", genRequest, request);

        Assertions.assertNotEquals(0, result);
    }

    @Test
    void testSaveRawData_NullUser() {
        GenChartByAiRequest genRequest = new GenChartByAiRequest();
        
        when(userService.getLoginUser(any())).thenThrow(new BusinessException(ErrorCode.NOT_LOGIN_ERROR));

        Assertions.assertThrows(BusinessException.class, () -> {
            chartService.saveRawData("csv data", genRequest, request);
        });
    }

    @Test
    void testGetChartByAi_Success() {
        User mockUser = new User();
        mockUser.setId(1L);

        GenChartByAiRequest genRequest = new GenChartByAiRequest();
        genRequest.setGoal("分析销售数据");
        genRequest.setChartType("柱状图");
        genRequest.setName("销售分析");

        String csvData = "date,amount\n2024-01,100\n2024-02,200";
        String aiResponse = "分析结论：销售数据呈上升趋势。=>=>=>{\"type\":\"bar\",\"data\":[]}";

        when(userService.getLoginUser(any())).thenReturn(mockUser);
        when(chartMapper.insert(any())).thenReturn(1);
        doNothing().when(userService).updateUserChartCount(anyLong());
        when(aiManager.doChartAnalysis(anyLong(), anyString())).thenReturn(aiResponse);

        BiResponse result = chartService.getChartByAi(csvData, genRequest, request);

        Assertions.assertNotNull(result);
        Assertions.assertNotNull(result.getChartId());
        Assertions.assertEquals(ChartStatusEnum.CHART_STATUS_SUCCESS.getValue(), result.getGenStatus());
    }

    @Test
    void testGetChartByAi_AiResponseEmpty() {
        User mockUser = new User();
        mockUser.setId(1L);

        GenChartByAiRequest genRequest = new GenChartByAiRequest();
        genRequest.setGoal("分析数据");

        when(userService.getLoginUser(any())).thenReturn(mockUser);
        when(chartMapper.insert(any())).thenReturn(1);
        doNothing().when(userService).updateUserChartCount(anyLong());
        when(aiManager.doChartAnalysis(anyLong(), anyString())).thenReturn("");

        BiResponse result = chartService.getChartByAi("csv data", genRequest, request);

        Assertions.assertEquals(ChartStatusEnum.CHART_STATUS_FAILURE.getValue(), result.getGenStatus());
    }

    @Test
    void testGetChartByAi_AiResponseOnlyJson() {
        User mockUser = new User();
        mockUser.setId(1L);

        GenChartByAiRequest genRequest = new GenChartByAiRequest();
        genRequest.setGoal("分析数据");

        String aiResponse = "{\"type\":\"bar\",\"series\":[]}";

        when(userService.getLoginUser(any())).thenReturn(mockUser);
        when(chartMapper.insert(any())).thenReturn(1);
        doNothing().when(userService).updateUserChartCount(anyLong());
        when(aiManager.doChartAnalysis(anyLong(), anyString())).thenReturn(aiResponse);

        BiResponse result = chartService.getChartByAi("csv data", genRequest, request);

        Assertions.assertNotNull(result);
        Assertions.assertEquals(ChartStatusEnum.CHART_STATUS_SUCCESS.getValue(), result.getGenStatus());
    }

    @Test
    void testByAiAsync_Success() {
        User mockUser = new User();
        mockUser.setId(1L);

        GenChartByAiRequest genRequest = new GenChartByAiRequest();
        genRequest.setGoal("异步分析");

        when(userService.getLoginUser(any())).thenReturn(mockUser);
        when(chartMapper.insert(any())).thenReturn(1);
        doNothing().when(userService).updateUserChartCount(anyLong());
        doNothing().when(threadPoolExecutor).execute(any(Runnable.class));

        BiResponse result = chartService.ByAiAsync("csv data", genRequest, request);

        Assertions.assertNotNull(result);
        Assertions.assertEquals(ChartStatusEnum.CHART_STATUS_WAITING.getValue(), result.getGenStatus());
        verify(threadPoolExecutor).execute(any(Runnable.class));
    }

    @Test
    void testReloadChartByAi_Success() {
        User mockUser = new User();
        mockUser.setId(1L);

        Chart existingChart = new Chart();
        existingChart.setId(1L);
        existingChart.setUserId(1L);
        existingChart.setGoal("原始分析目标");
        existingChart.setChartType("柱状图");
        existingChart.setChartData("csv data");

        String aiResponse = "重新分析完成=>=>=>{\"type\":\"bar\"}";

        when(userService.getLoginUser(any())).thenReturn(mockUser);
        when(chartMapper.selectById(anyLong())).thenReturn(existingChart);
        when(userService.isAdmin((User) any())).thenReturn(false);
        when(chartMapper.updateById(any())).thenReturn(1);
        when(aiManager.doChartAnalysis(anyLong(), anyString())).thenReturn(aiResponse);

        boolean result = chartService.reloadChartByAi(1L, request);

        Assertions.assertTrue(result);
    }

    @Test
    void testReloadChartByAi_NotFound() {
        User mockUser = new User();
        mockUser.setId(1L);

        when(userService.getLoginUser(any())).thenReturn(mockUser);
        when(chartMapper.selectById(anyLong())).thenReturn(null);

        Assertions.assertThrows(BusinessException.class, () -> {
            chartService.reloadChartByAi(999L, request);
        });
    }

    @Test
    void testReloadChartByAi_NoPermission() {
        User mockUser = new User();
        mockUser.setId(1L);

        Chart existingChart = new Chart();
        existingChart.setId(1L);
        existingChart.setUserId(2L);

        when(userService.getLoginUser(any())).thenReturn(mockUser);
        when(chartMapper.selectById(anyLong())).thenReturn(existingChart);
        when(userService.isAdmin((User) any())).thenReturn(false);

        Assertions.assertThrows(BusinessException.class, () -> {
            chartService.reloadChartByAi(1L, request);
        });
    }

    @Test
    void testGetFailedChart() {
        List<Long> mockFailedIds = new ArrayList<>();
        mockFailedIds.add(1L);
        mockFailedIds.add(2L);

        when(chartMapper.getFailedChart()).thenReturn(mockFailedIds);

        List<Long> result = chartService.getFailedChart();

        Assertions.assertNotNull(result);
        Assertions.assertEquals(2, result.size());
    }

    @Test
    void testBuildUserInput_WithChartType() {
        String goal = "分析销售趋势";
        String chartType = "折线图";
        String csvData = "date,value";

        try {
            java.lang.reflect.Method method = ChartServiceImpl.class.getDeclaredMethod("buildUserInput", 
                String.class, String.class, String.class);
            method.setAccessible(true);
            String result = (String) method.invoke(chartService, goal, chartType, csvData);

            Assertions.assertTrue(result.contains(goal));
            Assertions.assertTrue(result.contains(chartType));
            Assertions.assertTrue(result.contains(csvData));
            Assertions.assertTrue(result.contains("分析需求"));
            Assertions.assertTrue(result.contains("原始数据"));
        } catch (Exception e) {
            e.printStackTrace();
            Assertions.fail("反射调用失败");
        }
    }

    @Test
    void testBuildUserInput_WithoutChartType() {
        String goal = "分析销售趋势";
        String csvData = "date,value";

        try {
            java.lang.reflect.Method method = ChartServiceImpl.class.getDeclaredMethod("buildUserInput", 
                String.class, String.class, String.class);
            method.setAccessible(true);
            String result = (String) method.invoke(chartService, goal, null, csvData);

            Assertions.assertTrue(result.contains(goal));
            Assertions.assertFalse(result.contains("请使用"));
        } catch (Exception e) {
            e.printStackTrace();
            Assertions.fail("反射调用失败");
        }
    }

    @Test
    void testParseAndSaveChartResponse_ThreeParts() {
        String aiResponse = "分析结论=>=>=>{\"type\":\"bar\"}=>=>=>分析结果描述";
        
        try {
            java.lang.reflect.Method method = ChartServiceImpl.class.getDeclaredMethod("parseAndSaveChartResponse", 
                long.class, String.class);
            method.setAccessible(true);
            
            when(chartMapper.updateById(any())).thenReturn(1);
            
            BiResponse result = (BiResponse) method.invoke(chartService, 1L, aiResponse);

            Assertions.assertNotNull(result);
            Assertions.assertEquals(ChartStatusEnum.CHART_STATUS_SUCCESS.getValue(), result.getGenStatus());
        } catch (Exception e) {
            e.printStackTrace();
            Assertions.fail("反射调用失败");
        }
    }

    @Test
    void testParseAndSaveChartResponse_InvalidJson() {
        String aiResponse = "分析结论=>=>=>not valid json";
        
        try {
            java.lang.reflect.Method method = ChartServiceImpl.class.getDeclaredMethod("parseAndSaveChartResponse", 
                long.class, String.class);
            method.setAccessible(true);
            
            when(chartMapper.updateById(any())).thenReturn(1);
            
            BiResponse result = (BiResponse) method.invoke(chartService, 1L, aiResponse);

            Assertions.assertNotNull(result);
            Assertions.assertEquals("{}", result.getGenChart());
        } catch (Exception e) {
            e.printStackTrace();
            Assertions.fail("反射调用失败");
        }
    }
}