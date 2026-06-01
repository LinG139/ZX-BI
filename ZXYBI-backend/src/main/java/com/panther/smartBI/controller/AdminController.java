package com.panther.smartBI.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.panther.smartBI.annotation.AuthCheck;
import com.panther.smartBI.common.BaseResponse;
import com.panther.smartBI.common.DeleteRequest;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.common.ResultUtils;
import com.panther.smartBI.constant.UserConstant;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.exception.ThrowUtils;
import com.panther.smartBI.mapper.AiChatMapper;
import com.panther.smartBI.mapper.AiSessionMapper;
import com.panther.smartBI.mapper.ChartMapper;
import com.panther.smartBI.mapper.UserMapper;
import com.panther.smartBI.mapper.RechargeRecordMapper;
import com.panther.smartBI.mapper.OperationLogMapper;
import com.panther.smartBI.mapper.LoginLogMapper;
import com.panther.smartBI.model.dto.admin.*;
import com.panther.smartBI.model.entity.AiChat;
import com.panther.smartBI.model.entity.AiSession;
import com.panther.smartBI.model.entity.Chart;
import com.panther.smartBI.model.entity.User;
import com.panther.smartBI.model.entity.RechargeRecord;
import com.panther.smartBI.model.entity.OperationLog;
import com.panther.smartBI.model.entity.LoginLog;
import com.panther.smartBI.model.vo.admin.AdminDashboardVO;
import com.panther.smartBI.model.vo.admin.AiUsageStatsVO;
import com.panther.smartBI.model.vo.admin.ChartStatusStatsVO;
import com.panther.smartBI.model.vo.admin.LoginLogVO;
import com.panther.smartBI.model.vo.admin.OperationLogVO;
import com.panther.smartBI.service.MonitorService;
import com.panther.smartBI.service.UserService;
import com.panther.smartBI.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@Slf4j
public class AdminController {

    @Resource
    private UserMapper userMapper;
    
    @Resource
    private ChartMapper chartMapper;
    
    @Resource
    private AiSessionMapper aiSessionMapper;
    
    @Resource
    private AiChatMapper aiChatMapper;
    
    @Resource
    private RechargeRecordMapper rechargeRecordMapper;
    
    @Resource
    private OperationLogMapper operationLogMapper;
    
    @Resource
    private LoginLogMapper loginLogMapper;
    
    @Resource
    private UserService userService;

    @Resource
    private MonitorService monitorService;

    @PostMapping("/user/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<User>> listUserByPage(@RequestBody AdminUserQueryRequest adminUserQueryRequest,
                                                   HttpServletRequest request) {
        long current = adminUserQueryRequest.getCurrent();
        long size = adminUserQueryRequest.getPageSize();
        Page<User> userPage = userMapper.selectPage(new Page<>(current, size),
                getUserQueryWrapper(adminUserQueryRequest));
        return ResultUtils.success(userPage);
    }

    @PostMapping("/user/update/role")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateUserRole(@RequestParam Long userId, @RequestParam String role,
                                                HttpServletRequest request) {
        if (userId == null || userId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        if (!UserConstant.ADMIN_ROLE.equals(role) && !UserConstant.DEFAULT_ROLE.equals(role)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "角色参数错误");
        }
        User user = userMapper.selectById(userId);
        ThrowUtils.throwIf(user == null, ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        user.setUserRole(role);
        int result = userMapper.updateById(user);
        return ResultUtils.success(result > 0);
    }

    @PostMapping("/user/update/status")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateUserStatus(@RequestParam Long userId, @RequestParam Integer isDelete,
                                                  HttpServletRequest request) {
        if (userId == null || userId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        if (isDelete != 0 && isDelete != 1) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "状态参数错误");
        }
        User user = userMapper.selectById(userId);
        ThrowUtils.throwIf(user == null, ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        user.setIsDelete(isDelete);
        int result = userMapper.updateById(user);
        return ResultUtils.success(result > 0);
    }

    @PostMapping("/user/update/type")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateUserType(@RequestParam Long userId, @RequestParam String userType,
                                                 HttpServletRequest request) {
        if (userId == null || userId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        if (StringUtils.isBlank(userType)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "身份参数错误");
        }
        User user = userMapper.selectById(userId);
        ThrowUtils.throwIf(user == null, ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        
        if ("admin".equals(userType)) {
            user.setUserRole("admin");
            user.setIsVip(0);
        } else if ("vip".equals(userType)) {
            user.setUserRole("user");
            user.setIsVip(1);
        } else if ("user".equals(userType)) {
            user.setUserRole("user");
            user.setIsVip(0);
        } else {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "身份参数错误");
        }
        
        int result = userMapper.updateById(user);
        return ResultUtils.success(result > 0);
    }

    @PostMapping("/user/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteUser(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long id = deleteRequest.getId();
        User user = userMapper.selectById(id);
        ThrowUtils.throwIf(user == null, ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        if (UserConstant.ADMIN_ROLE.equals(user.getUserRole())) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "不能删除管理员");
        }
        int result = userMapper.deleteById(id);
        return ResultUtils.success(result > 0);
    }

    @PostMapping("/chart/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<Chart>> listChartByPage(@RequestBody AdminChartQueryRequest adminChartQueryRequest,
                                                     HttpServletRequest request) {
        long current = adminChartQueryRequest.getCurrent();
        long size = adminChartQueryRequest.getPageSize();
        Page<Chart> chartPage = chartMapper.selectPage(new Page<>(current, size),
                getChartQueryWrapper(adminChartQueryRequest));
        return ResultUtils.success(chartPage);
    }

    @GetMapping("/chart/status/stats")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<ChartStatusStatsVO> getChartStatusStats(HttpServletRequest request) {
        ChartStatusStatsVO statsVO = new ChartStatusStatsVO();
        statsVO.setWaitingCount(chartMapper.selectCount(new QueryWrapper<Chart>().eq("status", 0)));
        statsVO.setRunningCount(chartMapper.selectCount(new QueryWrapper<Chart>().eq("status", 2)));
        statsVO.setSuccessCount(chartMapper.selectCount(new QueryWrapper<Chart>().eq("status", 1)));
        statsVO.setFailedCount(chartMapper.selectCount(new QueryWrapper<Chart>().eq("status", -1)));
        statsVO.setTotalCount(chartMapper.selectCount(null));
        return ResultUtils.success(statsVO);
    }

    @PostMapping("/chart/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteChart(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long id = deleteRequest.getId();
        Chart chart = chartMapper.selectById(id);
        ThrowUtils.throwIf(chart == null, ErrorCode.NOT_FOUND_ERROR, "图表不存在");
        int result = chartMapper.deleteById(id);
        return ResultUtils.success(result > 0);
    }

    @GetMapping("/chart/get")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Chart> getChartById(@RequestParam Long id, HttpServletRequest request) {
        if (id == null || id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Chart chart = chartMapper.selectById(id);
        ThrowUtils.throwIf(chart == null, ErrorCode.NOT_FOUND_ERROR, "图表不存在");
        return ResultUtils.success(chart);
    }

    @PostMapping("/ai/session/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<AiSession>> listAiSessionByPage(@RequestBody AdminAiSessionQueryRequest request,
                                                             HttpServletRequest httpRequest) {
        long current = request.getCurrent();
        long size = request.getPageSize();
        Page<AiSession> sessionPage = aiSessionMapper.selectPage(new Page<>(current, size),
                getAiSessionQueryWrapper(request));
        return ResultUtils.success(sessionPage);
    }

    @PostMapping("/ai/chat/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<AiChat>> listAiChatByPage(@RequestBody AdminAiChatQueryRequest request,
                                                       HttpServletRequest httpRequest) {
        long current = request.getCurrent();
        long size = request.getPageSize();
        Page<AiChat> chatPage = aiChatMapper.selectPage(new Page<>(current, size),
                getAiChatQueryWrapper(request));
        return ResultUtils.success(chatPage);
    }

    @GetMapping("/ai/chat/list")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<List<AiChat>> listAiChatBySessionId(@RequestParam Long sessionId, HttpServletRequest request) {
        if (sessionId == null || sessionId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        List<AiChat> chatList = aiChatMapper.selectList(
                new QueryWrapper<AiChat>().eq("sessionId", sessionId).orderByAsc("createTime"));
        return ResultUtils.success(chatList);
    }

    @GetMapping("/ai/stats")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<AiUsageStatsVO> getAiUsageStats(HttpServletRequest request) {
        AiUsageStatsVO statsVO = new AiUsageStatsVO();
        statsVO.setTotalSessions(aiSessionMapper.selectCount(null));
        statsVO.setTotalChats(aiChatMapper.selectCount(null));
        
        Date today = getStartOfDay(new Date());
        statsVO.setTodayChats(aiChatMapper.selectCount(
                new QueryWrapper<AiChat>().ge("createTime", today)));
        
        Date weekAgo = getDateBefore(7);
        statsVO.setWeekChats(aiChatMapper.selectCount(
                new QueryWrapper<AiChat>().ge("createTime", weekAgo)));
        
        Date monthAgo = getDateBefore(30);
        statsVO.setMonthChats(aiChatMapper.selectCount(
                new QueryWrapper<AiChat>().ge("createTime", monthAgo)));
        
        return ResultUtils.success(statsVO);
    }

    @PostMapping("/ai/session/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteAiSession(@RequestBody DeleteRequest request, HttpServletRequest httpRequest) {
        if (request == null || request.getId() == null || request.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Long sessionId = request.getId();
        aiChatMapper.delete(new QueryWrapper<AiChat>().eq("sessionId", sessionId));
        aiSessionMapper.deleteById(sessionId);
        return ResultUtils.success(true);
    }

    @PostMapping("/ai/session/delete-all-chats")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteAllChatsInSession(@RequestBody DeleteRequest request, HttpServletRequest httpRequest) {
        if (request == null || request.getId() == null || request.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Long sessionId = request.getId();
        aiChatMapper.delete(new QueryWrapper<AiChat>().eq("sessionId", sessionId));
        return ResultUtils.success(true);
    }

    @PostMapping("/ai/chat/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteAiChat(@RequestBody DeleteRequest request, HttpServletRequest httpRequest) {
        if (request == null || request.getId() == null || request.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        aiChatMapper.deleteById(request.getId());
        return ResultUtils.success(true);
    }

    @GetMapping("/dashboard")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<AdminDashboardVO> getDashboard(HttpServletRequest request) {
        AdminDashboardVO dashboardVO = new AdminDashboardVO();
        
        dashboardVO.setTotalUsers(userMapper.selectCount(null));
        dashboardVO.setTotalCharts(chartMapper.selectCount(null));
        dashboardVO.setTotalAiSessions(aiSessionMapper.selectCount(null));
        dashboardVO.setTotalAiChats(aiChatMapper.selectCount(null));
        
        Date today = getStartOfDay(new Date());
        dashboardVO.setTodayNewUsers(userMapper.selectCount(
                new QueryWrapper<User>().ge("createTime", today)));
        dashboardVO.setTodayNewCharts(chartMapper.selectCount(
                new QueryWrapper<Chart>().ge("createTime", today)));
        dashboardVO.setTodayNewChats(aiChatMapper.selectCount(
                new QueryWrapper<AiChat>().ge("createTime", today)));
        
        dashboardVO.setWaitingCharts(chartMapper.selectCount(new QueryWrapper<Chart>().eq("status", 0)));
        dashboardVO.setRunningCharts(chartMapper.selectCount(new QueryWrapper<Chart>().eq("status", 2)));
        dashboardVO.setSuccessCharts(chartMapper.selectCount(new QueryWrapper<Chart>().eq("status", 1)));
        dashboardVO.setFailedCharts(chartMapper.selectCount(new QueryWrapper<Chart>().eq("status", -1)));
        
        Long totalPoints = 0L;
        List<User> users = userMapper.selectList(null);
        for (User user : users) {
            if (user.getLeftCount() != null) {
                totalPoints += user.getLeftCount();
            }
        }
        dashboardVO.setTotalUserPoints(totalPoints);
        
        dashboardVO.setUserTrend(getUserTrend(7));
        dashboardVO.setChartTrend(getChartTrend(7));
        
        return ResultUtils.success(dashboardVO);
    }

    @PostMapping("/logs/operation/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<OperationLog>> listOperationLogs(@RequestBody AdminLogQueryRequest request,
                                                              HttpServletRequest httpRequest) {
        long current = request.getCurrent();
        long size = request.getPageSize();
        Page<OperationLog> page = new Page<>(current, size);
        
        QueryWrapper<OperationLog> queryWrapper = new QueryWrapper<>();
        if (request.getUserId() != null) {
            queryWrapper.eq("userId", request.getUserId());
        }
        if (request.getStatus() != null) {
            queryWrapper.eq("status", request.getStatus());
        }
        if (StringUtils.isNotBlank(request.getSearchText())) {
            queryWrapper.and(wrapper -> wrapper.like("userName", request.getSearchText())
                    .or().like("operation", request.getSearchText())
                    .or().like("module", request.getSearchText()));
        }
        queryWrapper.orderByDesc("createTime");
        
        return ResultUtils.success(operationLogMapper.selectPage(page, queryWrapper));
    }

    @PostMapping("/logs/login/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<LoginLog>> listLoginLogs(@RequestBody AdminLogQueryRequest request,
                                                      HttpServletRequest httpRequest) {
        long current = request.getCurrent();
        long size = request.getPageSize();
        Page<LoginLog> page = new Page<>(current, size);
        
        QueryWrapper<LoginLog> queryWrapper = new QueryWrapper<>();
        if (request.getUserId() != null) {
            queryWrapper.eq("userId", request.getUserId());
        }
        if (request.getStatus() != null) {
            queryWrapper.eq("status", request.getStatus());
        }
        if (StringUtils.isNotBlank(request.getSearchText())) {
            queryWrapper.and(wrapper -> wrapper.like("userName", request.getSearchText())
                    .or().like("ip", request.getSearchText()));
        }
        queryWrapper.orderByDesc("createTime");
        
        return ResultUtils.success(loginLogMapper.selectPage(page, queryWrapper));
    }
    
    @PostMapping("/recharge/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<RechargeRecord>> listRechargeRecords(@RequestBody AdminRechargeQueryRequest request,
                                                                   HttpServletRequest httpRequest) {
        long current = request.getCurrent();
        long size = request.getPageSize();
        Page<RechargeRecord> page = new Page<>(current, size);
        
        QueryWrapper<RechargeRecord> queryWrapper = new QueryWrapper<>();
        if (request.getId() != null) {
            queryWrapper.eq("id", request.getId());
        }
        if (request.getUserId() != null) {
            queryWrapper.eq("userId", request.getUserId());
        }
        if (StringUtils.isNotBlank(request.getUserName())) {
            queryWrapper.like("userName", request.getUserName());
        }
        if (StringUtils.isNotBlank(request.getType())) {
            queryWrapper.eq("type", request.getType());
        }
        queryWrapper.orderByDesc("createTime");
        
        return ResultUtils.success(rechargeRecordMapper.selectPage(page, queryWrapper));
    }
    
    @PostMapping("/points/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateUserPoints(@RequestBody AdminUpdatePointsRequest request,
                                                   HttpServletRequest httpRequest) {
        if (request == null || request.getUserId() == null || request.getAmount() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        
        User user = userMapper.selectById(request.getUserId());
        ThrowUtils.throwIf(user == null, ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        
        int beforeCount = user.getLeftCount() != null ? user.getLeftCount() : 0;
        int afterCount = beforeCount + request.getAmount();
        
        user.setLeftCount(afterCount);
        userMapper.updateById(user);
        
        try {
            RechargeRecord record = new RechargeRecord();
            record.setUserId(user.getId());
            record.setUserName(user.getUserName());
            record.setAmount(request.getAmount());
            record.setBeforeCount(beforeCount);
            record.setAfterCount(afterCount);
            record.setType(request.getType() != null ? request.getType() : "管理员调整");
            record.setRemark(request.getRemark());
            record.setCreateTime(new Date());
            record.setIsDelete(0);
            rechargeRecordMapper.insert(record);
        } catch (Exception e) {
            log.error("保存积分调整记录失败", e);
        }
        
        return ResultUtils.success(true);
    }
    
    @PostMapping("/user/update/vip")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateUserVip(@RequestParam Long userId, @RequestParam Integer isVip,
                                                HttpServletRequest httpRequest) {
        if (userId == null || userId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        if (isVip != 0 && isVip != 1) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "VIP参数错误");
        }
        User user = userMapper.selectById(userId);
        ThrowUtils.throwIf(user == null, ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        user.setIsVip(isVip);
        int result = userMapper.updateById(user);
        return ResultUtils.success(result > 0);
    }

    private QueryWrapper<User> getUserQueryWrapper(AdminUserQueryRequest request) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        if (request.getId() != null) {
            queryWrapper.eq("id", request.getId());
        }
        if (StringUtils.isNotBlank(request.getUserAccount())) {
            queryWrapper.like("userAccount", request.getUserAccount());
        }
        if (StringUtils.isNotBlank(request.getUserName())) {
            queryWrapper.like("userName", request.getUserName());
        }
        if (StringUtils.isNotBlank(request.getUserRole())) {
            queryWrapper.eq("userRole", request.getUserRole());
        }
        String sortField = request.getSortField();
        String sortOrder = request.getSortOrder();
        queryWrapper.orderByAsc("createTime");
        return queryWrapper;
    }

    private QueryWrapper<Chart> getChartQueryWrapper(AdminChartQueryRequest request) {
        QueryWrapper<Chart> queryWrapper = new QueryWrapper<>();
        if (request.getId() != null) {
            queryWrapper.eq("id", request.getId());
        }
        if (request.getUserId() != null) {
            queryWrapper.eq("userId", request.getUserId());
        }
        if (StringUtils.isNotBlank(request.getName())) {
            queryWrapper.like("name", request.getName());
        }
        if (StringUtils.isNotBlank(request.getChartType())) {
            queryWrapper.like("chartType", request.getChartType());
        }
        if (request.getStatus() != null) {
            queryWrapper.eq("status", request.getStatus());
        }
        queryWrapper.orderByDesc("createTime");
        return queryWrapper;
    }

    private QueryWrapper<AiSession> getAiSessionQueryWrapper(AdminAiSessionQueryRequest request) {
        QueryWrapper<AiSession> queryWrapper = new QueryWrapper<>();
        if (request.getId() != null) {
            queryWrapper.eq("id", request.getId());
        }
        if (request.getUserId() != null) {
            queryWrapper.eq("userId", request.getUserId());
        }
        if (StringUtils.isNotBlank(request.getSessionName())) {
            queryWrapper.like("sessionName", request.getSessionName());
        }
        if (StringUtils.isNotBlank(request.getRole())) {
            queryWrapper.eq("role", request.getRole());
        }
        queryWrapper.orderByDesc("createTime");
        return queryWrapper;
    }

    private QueryWrapper<AiChat> getAiChatQueryWrapper(AdminAiChatQueryRequest request) {
        QueryWrapper<AiChat> queryWrapper = new QueryWrapper<>();
        if (request.getId() != null) {
            queryWrapper.eq("id", request.getId());
        }
        if (request.getSessionId() != null) {
            queryWrapper.eq("sessionId", request.getSessionId());
        }
        if (request.getUserId() != null) {
            queryWrapper.eq("userId", request.getUserId());
        }
        if (StringUtils.isNotBlank(request.getUserName())) {
            queryWrapper.like("userName", request.getUserName());
        }
        queryWrapper.orderByDesc("createTime");
        return queryWrapper;
    }

    private Date getStartOfDay(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    private Date getDateBefore(int days) {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -days);
        return calendar.getTime();
    }

    private List<AdminDashboardVO.UserTrendVO> getUserTrend(int days) {
        List<AdminDashboardVO.UserTrendVO> trend = new ArrayList<>();
        SimpleDateFormat sdf = new SimpleDateFormat("MM-dd");
        for (int i = days - 1; i >= 0; i--) {
            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.DAY_OF_MONTH, -i);
            Date start = getStartOfDay(calendar.getTime());
            calendar.add(Calendar.DAY_OF_MONTH, 1);
            Date end = calendar.getTime();
            
            Long count = userMapper.selectCount(
                    new QueryWrapper<User>().ge("createTime", start).lt("createTime", end));
            
            AdminDashboardVO.UserTrendVO vo = new AdminDashboardVO.UserTrendVO();
            vo.setDate(sdf.format(start));
            vo.setCount(count);
            trend.add(vo);
        }
        return trend;
    }

    private List<AdminDashboardVO.ChartTrendVO> getChartTrend(int days) {
        List<AdminDashboardVO.ChartTrendVO> trend = new ArrayList<>();
        SimpleDateFormat sdf = new SimpleDateFormat("MM-dd");
        for (int i = days - 1; i >= 0; i--) {
            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.DAY_OF_MONTH, -i);
            Date start = getStartOfDay(calendar.getTime());
            calendar.add(Calendar.DAY_OF_MONTH, 1);
            Date end = calendar.getTime();

            Long count = chartMapper.selectCount(
                    new QueryWrapper<Chart>().ge("createTime", start).lt("createTime", end));

            AdminDashboardVO.ChartTrendVO vo = new AdminDashboardVO.ChartTrendVO();
            vo.setDate(sdf.format(start));
            vo.setCount(count);
            trend.add(vo);
        }
        return trend;
    }

    @GetMapping("/monitor/stats")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<AdminMonitorVO> getMonitorStats(HttpServletRequest request) {
        AdminMonitorVO vo = new AdminMonitorVO();

        Map<String, Object> redisStatsMap = monitorService.getRedisStats();
        RedisStatsVO redisStats = new RedisStatsVO();
        redisStats.setConnected(Boolean.TRUE.equals(redisStatsMap.get("connected")));
        redisStats.setHitRate(redisStatsMap.get("hitRate") != null ? ((Number) redisStatsMap.get("hitRate")).doubleValue() : 0.0);
        redisStats.setMemoryUsed(redisStatsMap.get("memoryUsed") != null ? ((Number) redisStatsMap.get("memoryUsed")).intValue() : 0);
        redisStats.setMemoryTotal(redisStatsMap.get("memoryTotal") != null ? ((Number) redisStatsMap.get("memoryTotal")).intValue() : 0);
        redisStats.setOpsPerSec(redisStatsMap.get("opsPerSec") != null ? ((Number) redisStatsMap.get("opsPerSec")).doubleValue() : 0.0);
        redisStats.setKeysCount(redisStatsMap.get("keysCount") != null ? ((Number) redisStatsMap.get("keysCount")).intValue() : null);
        redisStats.setDbSize(redisStatsMap.get("dbSize") != null ? ((Number) redisStatsMap.get("dbSize")).longValue() : null);
        vo.setRedisStatus(redisStats);

        Map<String, Object> mqStatsMap = monitorService.getMqStats();
        MqStatsVO mqStats = new MqStatsVO();
        mqStats.setConnected(Boolean.TRUE.equals(mqStatsMap.get("connected")));
        mqStats.setQueueSize(mqStatsMap.get("queueSize") != null ? ((Number) mqStatsMap.get("queueSize")).intValue() : 0);
        mqStats.setConsumerCount(mqStatsMap.get("consumerCount") != null ? ((Number) mqStatsMap.get("consumerCount")).intValue() : 0);
        mqStats.setMessageRate(mqStatsMap.get("messageRate") != null ? ((Number) mqStatsMap.get("messageRate")).doubleValue() : 0.0);
        mqStats.setQueueName(mqStatsMap.get("queueName") != null ? mqStatsMap.get("queueName").toString() : "");
        mqStats.setMaxQueueSize(mqStatsMap.get("maxQueueSize") != null ? ((Number) mqStatsMap.get("maxQueueSize")).intValue() : null);
        mqStats.setPendingMessages(mqStatsMap.get("pendingMessages") != null ? ((Number) mqStatsMap.get("pendingMessages")).intValue() : null);
        vo.setMqStatus(mqStats);

        Map<String, Object> aiStatsMap = monitorService.getAiStats();
        AiMonitorStatsVO aiStats = new AiMonitorStatsVO();
        aiStats.setTotalCalls(aiStatsMap.get("totalCalls") != null ? ((Number) aiStatsMap.get("totalCalls")).longValue() : 0L);
        aiStats.setTodayCalls(aiStatsMap.get("todayCalls") != null ? ((Number) aiStatsMap.get("todayCalls")).longValue() : 0L);
        aiStats.setSuccessRate(aiStatsMap.get("successRate") != null ? ((Number) aiStatsMap.get("successRate")).doubleValue() : 0.0);
        aiStats.setAvgResponseTime(aiStatsMap.get("avgResponseTime") != null ? ((Number) aiStatsMap.get("avgResponseTime")).doubleValue() : 0.0);
        aiStats.setTotalTokens(aiStatsMap.get("totalTokens") != null ? ((Number) aiStatsMap.get("totalTokens")).longValue() : 0L);
        vo.setAiStats(aiStats);

        Map<String, Object> systemInfoMap = monitorService.getSystemInfo();
        SystemInfoVO systemInfo = new SystemInfoVO();
        systemInfo.setMemoryUsage(systemInfoMap.get("memoryUsage") != null ? ((Number) systemInfoMap.get("memoryUsage")).intValue() : 0);
        systemInfo.setMemoryTotal(systemInfoMap.get("memoryTotal") != null ? ((Number) systemInfoMap.get("memoryTotal")).intValue() : 0);
        systemInfo.setMemoryFree(systemInfoMap.get("memoryFree") != null ? ((Number) systemInfoMap.get("memoryFree")).intValue() : 0);
        systemInfo.setMemoryUsedPercent(systemInfoMap.get("memoryUsedPercent") != null ? ((Number) systemInfoMap.get("memoryUsedPercent")).intValue() : 0);
        systemInfo.setCpuUsage(systemInfoMap.get("cpuUsage") != null ? ((Number) systemInfoMap.get("cpuUsage")).intValue() : 0);
        systemInfo.setAvailableProcessors(systemInfoMap.get("availableProcessors") != null ? ((Number) systemInfoMap.get("availableProcessors")).intValue() : 0);
        systemInfo.setThreadCount(systemInfoMap.get("threadCount") != null ? ((Number) systemInfoMap.get("threadCount")).intValue() : 0);
        systemInfo.setPeakThreadCount(systemInfoMap.get("peakThreadCount") != null ? ((Number) systemInfoMap.get("peakThreadCount")).intValue() : 0);
        systemInfo.setUptime(systemInfoMap.get("uptime") != null ? ((Number) systemInfoMap.get("uptime")).longValue() : 0L);
        systemInfo.setUptimeFormatted(systemInfoMap.get("uptimeFormatted") != null ? systemInfoMap.get("uptimeFormatted").toString() : "");
        systemInfo.setRequestCount(systemInfoMap.get("requestCount") != null ? ((Number) systemInfoMap.get("requestCount")).longValue() : 0L);
        systemInfo.setOsName(systemInfoMap.get("osName") != null ? systemInfoMap.get("osName").toString() : "");
        systemInfo.setOsArch(systemInfoMap.get("osArch") != null ? systemInfoMap.get("osArch").toString() : "");
        systemInfo.setOsVersion(systemInfoMap.get("osVersion") != null ? systemInfoMap.get("osVersion").toString() : "");
        systemInfo.setJavaVersion(systemInfoMap.get("javaVersion") != null ? systemInfoMap.get("javaVersion").toString() : "");
        systemInfo.setHostName(systemInfoMap.get("hostName") != null ? systemInfoMap.get("hostName").toString() : "");
        systemInfo.setHostAddress(systemInfoMap.get("hostAddress") != null ? systemInfoMap.get("hostAddress").toString() : "");
        systemInfo.setGcCount(systemInfoMap.get("gcCount") != null ? ((Number) systemInfoMap.get("gcCount")).longValue() : 0L);
        systemInfo.setGcTime(systemInfoMap.get("gcTime") != null ? ((Number) systemInfoMap.get("gcTime")).longValue() : 0L);
        vo.setSystemInfo(systemInfo);

        return ResultUtils.success(vo);
    }

    public static class AdminMonitorVO {
        private RedisStatsVO redisStatus;
        private MqStatsVO mqStatus;
        private AiMonitorStatsVO aiStats;
        private SystemInfoVO systemInfo;

        public RedisStatsVO getRedisStatus() { return redisStatus; }
        public void setRedisStatus(RedisStatsVO redisStatus) { this.redisStatus = redisStatus; }
        public MqStatsVO getMqStatus() { return mqStatus; }
        public void setMqStatus(MqStatsVO mqStatus) { this.mqStatus = mqStatus; }
        public AiMonitorStatsVO getAiStats() { return aiStats; }
        public void setAiStats(AiMonitorStatsVO aiStats) { this.aiStats = aiStats; }
        public SystemInfoVO getSystemInfo() { return systemInfo; }
        public void setSystemInfo(SystemInfoVO systemInfo) { this.systemInfo = systemInfo; }
    }

    public static class RedisStatsVO {
        private boolean connected;
        private double hitRate;
        private int memoryUsed;
        private int memoryTotal;
        private double opsPerSec;
        private Integer keysCount;
        private Long dbSize;

        public boolean isConnected() { return connected; }
        public void setConnected(boolean connected) { this.connected = connected; }
        public double getHitRate() { return hitRate; }
        public void setHitRate(double hitRate) { this.hitRate = hitRate; }
        public int getMemoryUsed() { return memoryUsed; }
        public void setMemoryUsed(int memoryUsed) { this.memoryUsed = memoryUsed; }
        public int getMemoryTotal() { return memoryTotal; }
        public void setMemoryTotal(int memoryTotal) { this.memoryTotal = memoryTotal; }
        public double getOpsPerSec() { return opsPerSec; }
        public void setOpsPerSec(double opsPerSec) { this.opsPerSec = opsPerSec; }
        public Integer getKeysCount() { return keysCount; }
        public void setKeysCount(Integer keysCount) { this.keysCount = keysCount; }
        public Long getDbSize() { return dbSize; }
        public void setDbSize(Long dbSize) { this.dbSize = dbSize; }
    }

    public static class MqStatsVO {
        private boolean connected;
        private int queueSize;
        private int consumerCount;
        private double messageRate;
        private String queueName;
        private Integer maxQueueSize;
        private Integer pendingMessages;

        public boolean isConnected() { return connected; }
        public void setConnected(boolean connected) { this.connected = connected; }
        public int getQueueSize() { return queueSize; }
        public void setQueueSize(int queueSize) { this.queueSize = queueSize; }
        public int getConsumerCount() { return consumerCount; }
        public void setConsumerCount(int consumerCount) { this.consumerCount = consumerCount; }
        public double getMessageRate() { return messageRate; }
        public void setMessageRate(double messageRate) { this.messageRate = messageRate; }
        public String getQueueName() { return queueName; }
        public void setQueueName(String queueName) { this.queueName = queueName; }
        public Integer getMaxQueueSize() { return maxQueueSize; }
        public void setMaxQueueSize(Integer maxQueueSize) { this.maxQueueSize = maxQueueSize; }
        public Integer getPendingMessages() { return pendingMessages; }
        public void setPendingMessages(Integer pendingMessages) { this.pendingMessages = pendingMessages; }
    }

    public static class AiMonitorStatsVO {
        private long totalCalls;
        private long todayCalls;
        private double successRate;
        private double avgResponseTime;
        private long totalTokens;

        public long getTotalCalls() { return totalCalls; }
        public void setTotalCalls(long totalCalls) { this.totalCalls = totalCalls; }
        public long getTodayCalls() { return todayCalls; }
        public void setTodayCalls(long todayCalls) { this.todayCalls = todayCalls; }
        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double successRate) { this.successRate = successRate; }
        public double getAvgResponseTime() { return avgResponseTime; }
        public void setAvgResponseTime(double avgResponseTime) { this.avgResponseTime = avgResponseTime; }
        public long getTotalTokens() { return totalTokens; }
        public void setTotalTokens(long totalTokens) { this.totalTokens = totalTokens; }
    }

    public static class SystemInfoVO {
        private long uptime;
        private String uptimeFormatted;
        private int memoryUsage;
        private int memoryTotal;
        private int memoryFree;
        private int memoryUsedPercent;
        private int cpuUsage;
        private int availableProcessors;
        private int threadCount;
        private int peakThreadCount;
        private long requestCount;
        private String osName;
        private String osArch;
        private String osVersion;
        private String javaVersion;
        private String hostName;
        private String hostAddress;
        private long gcCount;
        private long gcTime;

        public long getUptime() { return uptime; }
        public void setUptime(long uptime) { this.uptime = uptime; }
        public String getUptimeFormatted() { return uptimeFormatted; }
        public void setUptimeFormatted(String uptimeFormatted) { this.uptimeFormatted = uptimeFormatted; }
        public int getMemoryUsage() { return memoryUsage; }
        public void setMemoryUsage(int memoryUsage) { this.memoryUsage = memoryUsage; }
        public int getMemoryTotal() { return memoryTotal; }
        public void setMemoryTotal(int memoryTotal) { this.memoryTotal = memoryTotal; }
        public int getMemoryFree() { return memoryFree; }
        public void setMemoryFree(int memoryFree) { this.memoryFree = memoryFree; }
        public int getMemoryUsedPercent() { return memoryUsedPercent; }
        public void setMemoryUsedPercent(int memoryUsedPercent) { this.memoryUsedPercent = memoryUsedPercent; }
        public int getCpuUsage() { return cpuUsage; }
        public void setCpuUsage(int cpuUsage) { this.cpuUsage = cpuUsage; }
        public int getAvailableProcessors() { return availableProcessors; }
        public void setAvailableProcessors(int availableProcessors) { this.availableProcessors = availableProcessors; }
        public int getThreadCount() { return threadCount; }
        public void setThreadCount(int threadCount) { this.threadCount = threadCount; }
        public int getPeakThreadCount() { return peakThreadCount; }
        public void setPeakThreadCount(int peakThreadCount) { this.peakThreadCount = peakThreadCount; }
        public long getRequestCount() { return requestCount; }
        public void setRequestCount(long requestCount) { this.requestCount = requestCount; }
        public String getOsName() { return osName; }
        public void setOsName(String osName) { this.osName = osName; }
        public String getOsArch() { return osArch; }
        public void setOsArch(String osArch) { this.osArch = osArch; }
        public String getOsVersion() { return osVersion; }
        public void setOsVersion(String osVersion) { this.osVersion = osVersion; }
        public String getJavaVersion() { return javaVersion; }
        public void setJavaVersion(String javaVersion) { this.javaVersion = javaVersion; }
        public String getHostName() { return hostName; }
        public void setHostName(String hostName) { this.hostName = hostName; }
        public String getHostAddress() { return hostAddress; }
        public void setHostAddress(String hostAddress) { this.hostAddress = hostAddress; }
        public long getGcCount() { return gcCount; }
        public void setGcCount(long gcCount) { this.gcCount = gcCount; }
        public long getGcTime() { return gcTime; }
        public void setGcTime(long gcTime) { this.gcTime = gcTime; }
    }
}