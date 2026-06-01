package com.panther.smartBI.aop;

import com.panther.smartBI.model.entity.OperationLog;
import com.panther.smartBI.model.entity.User;
import com.panther.smartBI.mapper.OperationLogMapper;
import com.panther.smartBI.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.UUID;

/**
 * 请求响应日志 AOP
 *
 **/
@Aspect
@Component
@Slf4j
public class LogInterceptor {

    @Resource
    private OperationLogMapper operationLogMapper;
    
    @Resource
    private UserService userService;

    /**
     * 执行拦截 所有的 Controller下的接口的调用信息
     * 以日志格式输出
     */
    @Around("execution(* com.panther.smartBI.controller.*.*(..))")
    public Object doInterceptor(ProceedingJoinPoint point) throws Throwable {
        // 计时
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        // 获取请求路径
        RequestAttributes requestAttributes = RequestContextHolder.currentRequestAttributes();
        HttpServletRequest httpServletRequest = ((ServletRequestAttributes) requestAttributes).getRequest();
        // 生成请求唯一 id
        String requestId = UUID.randomUUID().toString();
        String url = httpServletRequest.getRequestURI();
        String method = httpServletRequest.getMethod();
        String ip = httpServletRequest.getRemoteHost();
        // 获取请求参数
        Object[] args = point.getArgs();
        String reqParam = "[" + StringUtils.join(args, ", ") + "]";
        // 输出请求日志
        log.info("request start，id: {}, path: {}, ip: {}, params: {}", requestId, url, ip, reqParam);
        
        // 获取当前登录用户
        Long userId = null;
        String userName = null;
        try {
            User loginUser = userService.getLoginUser(httpServletRequest);
            if (loginUser != null) {
                userId = loginUser.getId();
                userName = loginUser.getUserName();
            }
        } catch (Exception e) {
            // 用户未登录，不记录用户信息
        }
        
        // 解析模块和操作
        String module = "未知模块";
        String operation = "未知操作";
        if (url.contains("/admin")) {
            module = "管理后台";
            if (url.contains("/user")) {
                operation = "用户管理";
            } else if (url.contains("/chart")) {
                operation = "图表管理";
            } else if (url.contains("/ai")) {
                operation = "AI管理";
            } else if (url.contains("/logs")) {
                operation = "日志查看";
            } else if (url.contains("/recharge")) {
                operation = "积分管理";
            } else if (url.contains("/dashboard")) {
                operation = "数据看板";
            } else if (url.contains("/monitor")) {
                operation = "系统监控";
            }
        } else if (url.contains("/user")) {
            module = "用户服务";
            if (url.contains("/login")) {
                operation = "用户登录";
            } else if (url.contains("/register")) {
                operation = "用户注册";
            } else if (url.contains("/logout")) {
                operation = "用户退出";
            } else if (url.contains("/recharge")) {
                operation = "积分充值";
            }
        } else if (url.contains("/chart")) {
            module = "图表服务";
            if (url.contains("/add")) {
                operation = "创建图表";
            } else if (url.contains("/my")) {
                operation = "我的图表";
            }
        } else if (url.contains("/ai")) {
            module = "AI服务";
            operation = "AI对话";
        }
        
        OperationLog operationLog = new OperationLog();
        operationLog.setUserId(userId);
        operationLog.setUserName(userName);
        operationLog.setOperation(operation);
        operationLog.setModule(module);
        operationLog.setMethod(method + " " + url);
        operationLog.setIp(ip);
        operationLog.setLocation("本地"); // 可以后续添加IP定位功能
        operationLog.setStatus(1);
        operationLog.setParams(reqParam.length() > 500 ? reqParam.substring(0, 500) : reqParam);
        operationLog.setCreateTime(new Date());
        
        Object result = null;
        try {
            // 执行原方法
            result = point.proceed();
            operationLog.setResult("成功");
            return result;
        } catch (Exception e) {
            operationLog.setStatus(0);
            operationLog.setErrorMessage(e.getMessage() != null ? e.getMessage().substring(0, 500) : "未知错误");
            throw e;
        } finally {
            // 输出响应日志
            stopWatch.stop();
            long totalTimeMillis = stopWatch.getTotalTimeMillis();
            operationLog.setDuration(totalTimeMillis);
            log.info("request end, id: {}, cost: {}ms", requestId, totalTimeMillis);
            
            // 保存日志到数据库（异步，不影响正常请求）
            try {
                if (operationLogMapper != null) {
                    operationLogMapper.insert(operationLog);
                }
            } catch (Exception e) {
                log.error("保存操作日志失败，不影响正常请求", e);
            }
        }
    }
}

