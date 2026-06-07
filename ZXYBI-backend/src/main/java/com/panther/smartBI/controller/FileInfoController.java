package com.panther.smartBI.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.panther.smartBI.annotation.AuthCheck;
import com.panther.smartBI.common.BaseResponse;
import com.panther.smartBI.common.DeleteRequest;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.common.ResultUtils;
import com.panther.smartBI.constant.UserConstant;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.exception.ThrowUtils;
import com.panther.smartBI.model.dto.file.FileInfoQueryRequest;
import com.panther.smartBI.model.entity.FileInfo;
import com.panther.smartBI.model.entity.User;
import com.panther.smartBI.service.FileInfoService;
import com.panther.smartBI.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 文件管理接口
 *
 * @author panther
 */
@RestController
@RequestMapping("/fileInfo")
@Slf4j
public class FileInfoController {

    @Resource
    private FileInfoService fileInfoService;

    @Resource
    private UserService userService;

    /**
     * 上传文件
     *
     * @param file 文件
     * @param request 请求
     * @return 文件信息
     */
    @PostMapping("/upload")
    public BaseResponse<FileInfo> uploadFile(@RequestPart("file") MultipartFile file, HttpServletRequest request) {
        FileInfo fileInfo = fileInfoService.uploadFile(file, request);
        return ResultUtils.success(fileInfo);
    }

    /**
     * 删除文件
     *
     * @param deleteRequest 删除请求
     * @param request 请求
     * @return 是否成功
     */
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteFile(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean result = fileInfoService.deleteFile(deleteRequest.getId(), request);
        return ResultUtils.success(result);
    }

    /**
     * 预览文件内容
     *
     * @param id 文件id
     * @param request 请求
     * @return 文件内容
     */
    @GetMapping("/preview")
    public BaseResponse<String> previewFile(@RequestParam("id") Long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        String content = fileInfoService.getFilePreview(id, request);
        return ResultUtils.success(content);
    }

    /**
     * 获取文件信息
     *
     * @param id 文件id
     * @param request 请求
     * @return 文件信息
     */
    @GetMapping("/get")
    public BaseResponse<FileInfo> getFileInfo(@RequestParam("id") Long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        FileInfo fileInfo = fileInfoService.getFileInfo(id, request);
        return ResultUtils.success(fileInfo);
    }

    /**
     * 分页获取当前用户的文件列表
     *
     * @param fileInfoQueryRequest 查询请求
     * @param request 请求
     * @return 文件列表
     */
    @PostMapping("/list/my/page")
    public BaseResponse<Page<FileInfo>> listMyFileByPage(@RequestBody FileInfoQueryRequest fileInfoQueryRequest, HttpServletRequest request) {
        if (fileInfoQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User loginUser = userService.getLoginUser(request);
        fileInfoQueryRequest.setUserId(loginUser.getId());
        long current = fileInfoQueryRequest.getCurrent();
        long size = fileInfoQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 50, ErrorCode.PARAMS_ERROR);
        Page<FileInfo> filePage = fileInfoService.page(new Page<>(current, size), fileInfoService.getQueryWrapper(fileInfoQueryRequest));
        return ResultUtils.success(filePage);
    }

    /**
     * 分页获取所有用户的文件列表（仅管理员）
     *
     * @param fileInfoQueryRequest 查询请求
     * @param request 请求
     * @return 文件列表
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<FileInfo>> listFileByPage(@RequestBody FileInfoQueryRequest fileInfoQueryRequest, HttpServletRequest request) {
        if (fileInfoQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long current = fileInfoQueryRequest.getCurrent();
        long size = fileInfoQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 50, ErrorCode.PARAMS_ERROR);
        Page<FileInfo> filePage = fileInfoService.page(new Page<>(current, size), fileInfoService.getQueryWrapper(fileInfoQueryRequest));
        return ResultUtils.success(filePage);
    }

    /**
     * 下载文件（需要时可以开放）
     * 暂时不提供，避免安全问题
     */
}
