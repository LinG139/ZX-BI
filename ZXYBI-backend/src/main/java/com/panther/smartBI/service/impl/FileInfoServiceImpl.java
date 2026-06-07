package com.panther.smartBI.service.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.crypto.digest.DigestUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.constant.BiConstant;
import com.panther.smartBI.constant.FileConstant;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.exception.ThrowUtils;
import com.panther.smartBI.mapper.FileInfoMapper;
import com.panther.smartBI.model.entity.FileInfo;
import com.panther.smartBI.model.entity.FileCategory;
import com.panther.smartBI.model.entity.User;
import com.panther.smartBI.service.FileInfoService;
import com.panther.smartBI.service.FileCategoryService;
import com.panther.smartBI.service.UserService;
import com.panther.smartBI.utils.FileParserUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.Date;

/**
 * 文件信息服务实现
 *
 * @author panther
 */
@Service
@Slf4j
public class FileInfoServiceImpl extends ServiceImpl<FileInfoMapper, FileInfo> implements FileInfoService {

    @Resource
    private UserService userService;

    @Resource
    private FileCategoryService fileCategoryService;

    @Override
    public QueryWrapper<FileInfo> getQueryWrapper(com.panther.smartBI.model.dto.file.FileInfoQueryRequest fileInfoQueryRequest) {
        if (fileInfoQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数为空");
        }
        Long id = fileInfoQueryRequest.getId();
        String fileName = fileInfoQueryRequest.getFileName();
        String fileFormat = fileInfoQueryRequest.getFileFormat();
        Long userId = fileInfoQueryRequest.getUserId();
        Long categoryId = fileInfoQueryRequest.getCategoryId();
        String sortField = fileInfoQueryRequest.getSortField();
        String sortOrder = fileInfoQueryRequest.getSortOrder();

        QueryWrapper<FileInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(id != null, "id", id);
        queryWrapper.like(StringUtils.isNotBlank(fileName), "fileName", fileName);
        queryWrapper.eq(StringUtils.isNotBlank(fileFormat), "fileFormat", fileFormat);
        queryWrapper.eq(userId != null, "userId", userId);
        queryWrapper.eq(categoryId != null, "categoryId", categoryId);
        queryWrapper.orderBy(StringUtils.isNotBlank(sortField), sortOrder.equals("asc"), sortField);
        return queryWrapper;
    }

    @Override
    public FileInfo uploadFile(MultipartFile file, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }

        // 验证文件
        ThrowUtils.throwIf(file == null, ErrorCode.PARAMS_ERROR, "文件为空");
        long size = file.getSize();
        ThrowUtils.throwIf(size > FileConstant.MAX_FILE_SIZE * 10, ErrorCode.SYSTEM_ERROR, "文件超过10MB");
        String originalFilename = file.getOriginalFilename();
        String fileSuffix = FileUtil.getSuffix(originalFilename);
        ThrowUtils.throwIf(!BiConstant.VALID_FILE_SUFFIX_LIST.contains(fileSuffix), ErrorCode.PARAMS_ERROR, 
            "文件格式有误，支持的格式: " + String.join(", ", BiConstant.VALID_FILE_SUFFIX_LIST));

        // 计算文件MD5
        String fileMd5;
        try {
            fileMd5 = DigestUtil.md5Hex(file.getInputStream());
        } catch (Exception e) {
            log.error("计算文件MD5失败", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件处理失败");
        }

        // 检查文件是否已存在（MD5查重）
        QueryWrapper<FileInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("fileMd5", fileMd5);
        queryWrapper.eq("userId", loginUser.getId());
        FileInfo existFile = this.getOne(queryWrapper);
        if (existFile != null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "文件已存在，请勿重复上传");
        }

        // 获取文件分类
        FileCategory category = fileCategoryService.getCategoryBySuffix(fileSuffix);

        // 保存文件到本地
        String uploadDir = FileConstant.LOCAL_UPLOAD_PATH + File.separator + "data_files" + File.separator + loginUser.getId();
        File uploadDirFile = new File(uploadDir);
        if (!uploadDirFile.exists()) {
            boolean mkdirs = uploadDirFile.mkdirs();
            if (!mkdirs) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "创建上传目录失败");
            }
        }

        String safeFilename = System.currentTimeMillis() + "_" + originalFilename;
        String filePath = uploadDir + File.separator + safeFilename;

        try {
            file.transferTo(new File(filePath));
        } catch (Exception e) {
            log.error("文件保存失败", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件保存失败");
        }

        // 保存文件信息到数据库
        FileInfo fileInfo = new FileInfo();
        fileInfo.setFileName(originalFilename);
        fileInfo.setFileFormat(fileSuffix);
        fileInfo.setFileSize(size);
        fileInfo.setFilePath(filePath);
        fileInfo.setFileMd5(fileMd5);
        fileInfo.setUserId(loginUser.getId());
        fileInfo.setCategoryId(category != null ? category.getId() : null);
        fileInfo.setCreateTime(new Date());
        fileInfo.setUpdateTime(new Date());
        fileInfo.setIsDelete(0);

        try {
            boolean saveResult = this.save(fileInfo);
            if (!saveResult) {
                // 删除已保存的文件
                FileUtil.del(filePath);
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件信息保存失败");
            }
        } catch (Exception e) {
            // 处理重复插入的情况（幂等性保障）
            if (e.getMessage() != null && e.getMessage().contains("Duplicate entry") && e.getMessage().contains("uk_user_md5")) {
                // 查询已存在的文件信息并返回
                QueryWrapper<FileInfo> existQueryWrapper = new QueryWrapper<>();
                existQueryWrapper.eq("fileMd5", fileMd5);
                existQueryWrapper.eq("userId", loginUser.getId());
                FileInfo existingFile = this.getOne(existQueryWrapper);
                if (existingFile != null) {
                    // 删除刚保存的重复文件
                    FileUtil.del(filePath);
                    return existingFile;
                }
            }
            // 删除已保存的文件
            FileUtil.del(filePath);
            throw e;
        }

        return fileInfo;
    }

    @Override
    public boolean deleteFile(Long fileId, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }

        FileInfo fileInfo = this.getById(fileId);
        if (fileInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "文件不存在");
        }

        // 仅本人或管理员可删除
        if (!fileInfo.getUserId().equals(loginUser.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }

        // 删除文件
        if (StringUtils.isNotBlank(fileInfo.getFilePath())) {
            FileUtil.del(fileInfo.getFilePath());
        }

        return this.removeById(fileId);
    }

    @Override
    public String getFilePreview(Long fileId, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }

        FileInfo fileInfo = this.getById(fileId);
        if (fileInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "文件不存在");
        }

        // 仅本人或管理员可预览
        if (!fileInfo.getUserId().equals(loginUser.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }

        // 读取文件并解析为可预览的格式
        File file = new File(fileInfo.getFilePath());
        if (!file.exists()) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "文件不存在");
        }

        try {
            // 使用文件处理为了预览，我们使用FileParserUtils转换为CSV格式
            MultipartFile mockMultipartFile = new MockMultipartFile(fileInfo.getFileName(), fileInfo.getFileName(), 
                "application/octet-stream", FileUtil.readBytes(file));
            return FileParserUtils.parseFileToCsv(mockMultipartFile, fileInfo.getFileFormat());
        } catch (Exception e) {
            log.error("文件预览失败", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件预览失败");
        }
    }

    @Override
    public FileInfo getFileInfo(Long fileId, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }

        FileInfo fileInfo = this.getById(fileId);
        if (fileInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "文件不存在");
        }

        // 仅本人或管理员可查看
        if (!fileInfo.getUserId().equals(loginUser.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }

        return fileInfo;
    }

    // 一个简单的 MockMultipartFile 实现
    static class MockMultipartFile implements MultipartFile {
        private final String name;
        private final String originalFilename;
        private final String contentType;
        private final byte[] content;

        public MockMultipartFile(String name, String originalFilename, String contentType, byte[] content) {
            this.name = name;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
            this.content = content;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getOriginalFilename() {
            return originalFilename;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content == null || content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        public byte[] getBytes() throws IOException {
            return content;
        }

        @Override
        public java.io.InputStream getInputStream() throws IOException {
            return new java.io.ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(java.io.File dest) throws IOException, IllegalStateException {
            FileUtil.writeBytes(content, dest);
        }
    }
}
