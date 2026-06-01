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
import com.panther.smartBI.model.entity.User;
import com.panther.smartBI.model.entity.LoginLog;
import com.panther.smartBI.model.entity.RechargeRecord;
import com.panther.smartBI.model.vo.LoginUserVO;
import com.panther.smartBI.model.vo.UserVO;
import com.panther.smartBI.service.UserService;
import com.panther.smartBI.mapper.LoginLogMapper;
import com.panther.smartBI.mapper.RechargeRecordMapper;
import com.panther.smartBI.model.dto.user.UserAddRequest;
import com.panther.smartBI.model.dto.user.UserLoginRequest;
import com.panther.smartBI.model.dto.user.UserQueryRequest;
import com.panther.smartBI.model.dto.user.UserRegisterRequest;
import com.panther.smartBI.model.dto.user.UserUpdateMyRequest;
import com.panther.smartBI.model.dto.user.UserUpdateRequest;

import java.util.List;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户接口
 */
@RestController
@RequestMapping("/user")
@Slf4j
public class UserController {

    @Resource
    private UserService userService;
    
    @Resource
    private LoginLogMapper loginLogMapper;
    
    @Resource
    private RechargeRecordMapper rechargeRecordMapper;

    // region 登录相关

    /**
     * 用户注册
     *
     * @param userRegisterRequest
     * @return
     */
    @PostMapping("/register")
    public BaseResponse<Long> userRegister(@RequestBody UserRegisterRequest userRegisterRequest) {
        if (userRegisterRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        String userAccount = userRegisterRequest.getUserAccount();
        String userPassword = userRegisterRequest.getUserPassword();
        String checkPassword = userRegisterRequest.getCheckPassword();
        String userName = userRegisterRequest.getUserName();
        String userAvatar = userRegisterRequest.getUserAvatar();
        if (StringUtils.isAnyBlank(userAccount, userPassword, checkPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "参数为空");
        }
        long result = userService.userRegister(userAccount, userPassword, checkPassword, userName, userAvatar);
        return ResultUtils.success(result);
    }

    /**
     * 用户登录
     *
     * @param userLoginRequest
     * @param request
     * @return
     */
    @PostMapping("/login")
    public BaseResponse<LoginUserVO> userLogin(@RequestBody UserLoginRequest userLoginRequest, HttpServletRequest request) {
        LoginLog loginLog = new LoginLog();
        loginLog.setIp(request.getRemoteAddr());
        loginLog.setLocation("本地");
        loginLog.setDevice(request.getHeader("User-Agent"));
        loginLog.setCreateTime(new java.util.Date());
        
        try {
            if (userLoginRequest == null) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR);
            }
            String userAccount = userLoginRequest.getUserAccount();
            String userPassword = userLoginRequest.getUserPassword();
            if (StringUtils.isAnyBlank(userAccount, userPassword)) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR);
            }
            LoginUserVO loginUserVO = userService.userLogin(userAccount, userPassword, request);
            
            // 记录登录日志
            try {
                loginLog.setUserId(loginUserVO.getId());
                loginLog.setUserName(loginUserVO.getUserName());
                loginLog.setStatus(1);
                loginLogMapper.insert(loginLog);
            } catch (Exception e) {
                log.error("保存登录日志失败", e);
            }
            
            return ResultUtils.success(loginUserVO);
        } catch (Exception e) {
            // 记录失败的登录日志
            try {
                loginLog.setStatus(0);
                loginLogMapper.insert(loginLog);
            } catch (Exception ex) {
                log.error("保存登录日志失败", ex);
            }
            throw e;
        }
    }

    /**
     * 用户注销
     *
     * @param request
     * @return
     */
    @PostMapping("/logout")
    public BaseResponse<Boolean> userLogout(HttpServletRequest request) {
        if (request == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean result = userService.userLogout(request);
        return ResultUtils.success(result);
    }

    /**
     * 获取当前登录用户
     *
     * @param request
     * @return
     */
    @GetMapping("/get/login")
    public BaseResponse<LoginUserVO> getLoginUser(HttpServletRequest request) {
        User user = userService.getLoginUser(request);
        return ResultUtils.success(userService.getLoginUserVO(user));
    }

    // endregion

    // region 增删改查

    /**
     * 创建用户
     *
     * @param userAddRequest
     * @param request
     * @return
     */
    @PostMapping("/add")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Long> addUser(@RequestBody UserAddRequest userAddRequest, HttpServletRequest request) {
        if (userAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        String userAccount = userAddRequest.getUserAccount();
        String userPassword = userAddRequest.getUserPassword();
        String userName = userAddRequest.getUserName();
        String userAvatar = userAddRequest.getUserAvatar();
        String userRole = userAddRequest.getUserRole();
        
        if (StringUtils.isAnyBlank(userAccount, userPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号或密码为空");
        }
        if (userAccount.length() < 4) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户账号过短");
        }
        if (userPassword.length() < 8) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户密码过短");
        }
        
        synchronized (userAccount.intern()) {
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("userAccount", userAccount);
            long count = userService.count(queryWrapper);
            if (count > 0) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号重复");
            }
            
            String salt = "panther";
            String encryptPassword = org.springframework.util.DigestUtils.md5DigestAsHex((salt + userPassword).getBytes());
            
            User user = new User();
            user.setUserAccount(userAccount);
            user.setUserPassword(encryptPassword);
            user.setUserName(StringUtils.isNotBlank(userName) ? userName : userAccount);
            user.setUserAvatar(userAvatar);
            user.setUserRole(StringUtils.isNotBlank(userRole) ? userRole : "user");
            user.setLeftCount(100);
            user.setIsVip(0);
            boolean result = userService.save(user);
            ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
            return ResultUtils.success(user.getId());
        }
    }

    /**
     * 删除用户
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteUser(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean b = userService.removeById(deleteRequest.getId());
        return ResultUtils.success(b);
    }

    /**
     * 更新用户
     *
     * @param userUpdateRequest
     * @param request
     * @return
     */
    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateUser(@RequestBody UserUpdateRequest userUpdateRequest,
            HttpServletRequest request) {
        if (userUpdateRequest == null || userUpdateRequest.getId() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = new User();
        BeanUtils.copyProperties(userUpdateRequest, user);
        boolean result = userService.updateById(user);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 根据 id 获取用户（仅管理员）
     *
     * @param id
     * @param request
     * @return
     */
    @GetMapping("/get")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<User> getUserById(long id, HttpServletRequest request) {
        if (id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getById(id);
        ThrowUtils.throwIf(user == null, ErrorCode.NOT_FOUND_ERROR);
        return ResultUtils.success(user);
    }

    /**
     * 根据 id 获取包装类
     *
     * @param id
     * @param request
     * @return
     */
    @GetMapping("/get/vo")
    public BaseResponse<UserVO> getUserVOById(long id, HttpServletRequest request) {
        BaseResponse<User> response = getUserById(id, request);
        User user = response.getData();
        return ResultUtils.success(userService.getUserVO(user));
    }

    /**
     * 分页获取用户列表（仅管理员）
     *
     * @param userQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<User>> listUserByPage(@RequestBody UserQueryRequest userQueryRequest,
            HttpServletRequest request) {
        long current = userQueryRequest.getCurrent();
        long size = userQueryRequest.getPageSize();
        Page<User> userPage = userService.page(new Page<>(current, size),
                userService.getQueryWrapper(userQueryRequest));
        return ResultUtils.success(userPage);
    }

    /**
     * 分页获取用户封装列表
     *
     * @param userQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<UserVO>> listUserVOByPage(@RequestBody UserQueryRequest userQueryRequest,
            HttpServletRequest request) {
        if (userQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long current = userQueryRequest.getCurrent();
        long size = userQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        Page<User> userPage = userService.page(new Page<>(current, size),
                userService.getQueryWrapper(userQueryRequest));
        Page<UserVO> userVOPage = new Page<>(current, size, userPage.getTotal());
        List<UserVO> userVO = userService.getUserVO(userPage.getRecords());
        userVOPage.setRecords(userVO);
        return ResultUtils.success(userVOPage);
    }

    // endregion

    /**
     * 更新个人信息
     *
     * @param userUpdateMyRequest
     * @param request
     * @return
     */
    @PostMapping("/update/my")
    public BaseResponse<Boolean> updateMyUser(@RequestBody UserUpdateMyRequest userUpdateMyRequest,
            HttpServletRequest request) {
        if (userUpdateMyRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User loginUser = userService.getLoginUser(request);
        User user = new User();
        BeanUtils.copyProperties(userUpdateMyRequest, user);
        user.setId(loginUser.getId());
        boolean result = userService.updateById(user);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 充值积分
     *
     * @param count   充值数量
     * @param request
     * @return
     */
    @PostMapping("/recharge")
    public BaseResponse<Integer> rechargeUserCount(@RequestParam("count") int count, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        int beforeCount = loginUser.getLeftCount() != null ? loginUser.getLeftCount() : 0;
        
        int result = userService.rechargeUserCount(request, count);
        
        // 记录充值记录
        try {
            RechargeRecord record = new RechargeRecord();
            record.setUserId(loginUser.getId());
            record.setUserName(loginUser.getUserName());
            record.setAmount(count);
            record.setBeforeCount(beforeCount);
            record.setAfterCount(result);
            record.setType("用户充值");
            record.setRemark("用户自助充值");
            record.setCreateTime(new java.util.Date());
            record.setIsDelete(0);
            rechargeRecordMapper.insert(record);
        } catch (Exception e) {
            log.error("保存充值记录失败", e);
        }
        
        return ResultUtils.success(result);
    }
}
