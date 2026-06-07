package com.panther.smartBI.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.panther.smartBI.model.dto.file.FileInfoQueryRequest;
import com.panther.smartBI.model.entity.FileInfo;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 文件信息表服务接口
 *
 * @author panther
 * @since 2025-06-06
 */
public interface FileInfoService extends IService<FileInfo> {

    QueryWrapper<FileInfo> getQueryWrapper(FileInfoQueryRequest fileInfoQueryRequest);

    FileInfo uploadFile(MultipartFile file, HttpServletRequest request);

    boolean deleteFile(Long fileId, HttpServletRequest request);

    String getFilePreview(Long fileId, HttpServletRequest request);

    FileInfo getFileInfo(Long fileId, HttpServletRequest request);
}
