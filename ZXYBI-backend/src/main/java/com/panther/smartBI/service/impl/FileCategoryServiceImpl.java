package com.panther.smartBI.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.mapper.FileCategoryMapper;
import com.panther.smartBI.model.dto.file.FileCategoryQueryRequest;
import com.panther.smartBI.model.entity.FileCategory;
import com.panther.smartBI.service.FileCategoryService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Arrays;
import java.util.List;

/**
 * 文件分类服务实现
 *
 * @author panther
 */
@Service
@Slf4j
public class FileCategoryServiceImpl extends ServiceImpl<FileCategoryMapper, FileCategory> implements FileCategoryService {

    @Override
    public QueryWrapper<FileCategory> getQueryWrapper(FileCategoryQueryRequest fileCategoryQueryRequest) {
        if (fileCategoryQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数为空");
        }
        Long id = fileCategoryQueryRequest.getId();
        String categoryName = fileCategoryQueryRequest.getCategoryName();
        String sortField = fileCategoryQueryRequest.getSortField();
        String sortOrder = fileCategoryQueryRequest.getSortOrder();

        QueryWrapper<FileCategory> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(id != null, "id", id);
        queryWrapper.like(StringUtils.isNotBlank(categoryName), "categoryName", categoryName);
        queryWrapper.orderBy(StringUtils.isNotBlank(sortField), sortOrder.equals("asc"), sortField);
        return queryWrapper;
    }

    @Override
    public FileCategory getCategoryBySuffix(String suffix) {
        if (StringUtils.isBlank(suffix)) {
            return null;
        }
        
        // 查询所有分类
        List<FileCategory> categories = this.list();
        for (FileCategory category : categories) {
            String fileSuffixes = category.getFileSuffixes();
            if (StringUtils.isNotBlank(fileSuffixes)) {
                List<String> suffixList = Arrays.asList(fileSuffixes.split(","));
                if (suffixList.contains(suffix.toLowerCase())) {
                    return category;
                }
            }
        }
        
        return null;
    }

    @Override
    public void initDefaultCategories() {
        // 检查是否已初始化
        long count = this.count();
        if (count > 0) {
            log.info("文件分类已初始化，跳过");
            return;
        }
        
        // 初始化默认分类
        List<FileCategory> defaultCategories = Arrays.asList(
            createCategory("CSV文件", "csv"),
            createCategory("Excel文件", "xlsx,xls"),
            createCategory("文本文件", "txt,dat"),
            createCategory("JSON文件", "json"),
            createCategory("ODS文件", "ods"),
            createCategory("Parquet文件", "parquet"),
            createCategory("SQLite数据库", "db")
        );
        
        this.saveBatch(defaultCategories);
        log.info("初始化默认文件分类完成");
    }
    
    private FileCategory createCategory(String categoryName, String fileSuffixes) {
        FileCategory category = new FileCategory();
        category.setCategoryName(categoryName);
        category.setFileSuffixes(fileSuffixes);
        return category;
    }
}