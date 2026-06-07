package com.panther.smartBI.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.panther.smartBI.model.dto.file.FileCategoryQueryRequest;
import com.panther.smartBI.model.entity.FileCategory;

/**
 * 文件分类表服务接口
 *
 * @author panther
 * @since 2025-06-06
 */
public interface FileCategoryService extends IService<FileCategory> {

    QueryWrapper<FileCategory> getQueryWrapper(FileCategoryQueryRequest fileCategoryQueryRequest);

    FileCategory getCategoryBySuffix(String suffix);

    void initDefaultCategories();
}
