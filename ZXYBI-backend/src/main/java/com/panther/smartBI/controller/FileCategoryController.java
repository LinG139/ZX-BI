package com.panther.smartBI.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.panther.smartBI.annotation.AuthCheck;
import com.panther.smartBI.common.BaseResponse;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.common.ResultUtils;
import com.panther.smartBI.constant.UserConstant;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.exception.ThrowUtils;
import com.panther.smartBI.model.dto.file.FileCategoryQueryRequest;
import com.panther.smartBI.model.entity.FileCategory;
import com.panther.smartBI.service.FileCategoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 文件分类管理接口
 *
 * @author panther
 */
@RestController
@RequestMapping("/fileCategory")
@Slf4j
public class FileCategoryController {

    @Resource
    private FileCategoryService fileCategoryService;

    /**
     * 获取所有文件分类
     *
     * @return 分类列表
     */
    @GetMapping("/list")
    public BaseResponse<List<FileCategory>> listFileCategory() {
        List<FileCategory> categoryList = fileCategoryService.list();
        return ResultUtils.success(categoryList);
    }

    /**
     * 分页获取文件分类（仅管理员）
     *
     * @param fileCategoryQueryRequest 查询请求
     * @param request 请求
     * @return 分类列表
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<FileCategory>> listFileCategoryByPage(@RequestBody FileCategoryQueryRequest fileCategoryQueryRequest, HttpServletRequest request) {
        if (fileCategoryQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long current = fileCategoryQueryRequest.getCurrent();
        long size = fileCategoryQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 50, ErrorCode.PARAMS_ERROR);
        Page<FileCategory> categoryPage = fileCategoryService.page(new Page<>(current, size), fileCategoryService.getQueryWrapper(fileCategoryQueryRequest));
        return ResultUtils.success(categoryPage);
    }

    /**
     * 根据id获取分类（仅管理员）
     *
     * @param id 分类id
     * @return 分类信息
     */
    @GetMapping("/get")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<FileCategory> getFileCategoryById(@RequestParam("id") Long id) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        FileCategory category = fileCategoryService.getById(id);
        return ResultUtils.success(category);
    }
}
