package com.panther.smartBI.controller;

import cn.hutool.core.io.FileUtil;
import com.panther.smartBI.common.BaseResponse;
import com.panther.smartBI.common.ErrorCode;
import com.panther.smartBI.common.ResultUtils;
import com.panther.smartBI.constant.FileConstant;
import com.panther.smartBI.exception.BusinessException;
import com.panther.smartBI.model.dto.file.UploadFileRequest;
import com.panther.smartBI.model.entity.User;
import com.panther.smartBI.model.enums.FileUploadBizEnum;
import com.panther.smartBI.service.UserService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.UUID;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/file")
@Slf4j
public class FileController {

    @Resource
    private UserService userService;

    @Value("${server.port:9001}")
    private String serverPort;

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    @PostMapping("/upload")
    public BaseResponse<String> uploadFile(@RequestPart("file") MultipartFile multipartFile,
                                           UploadFileRequest uploadFileRequest, HttpServletRequest request) {
        String biz = uploadFileRequest.getBiz();
        FileUploadBizEnum fileUploadBizEnum = FileUploadBizEnum.getEnumByValue(biz);
        if (fileUploadBizEnum == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        validFile(multipartFile, fileUploadBizEnum);
        User loginUser = userService.getLoginUser(request);

        String uuid = RandomStringUtils.randomAlphanumeric(8);
        String originalFilename = multipartFile.getOriginalFilename();
        String fileSuffix = FileUtil.getSuffix(originalFilename);
        String safeFilename = uuid + "." + fileSuffix;
        
        String uploadDir = FileConstant.LOCAL_UPLOAD_PATH + File.separator + fileUploadBizEnum.getValue() + File.separator + loginUser.getId();
        File uploadDirFile = new File(uploadDir);
        if (!uploadDirFile.exists()) {
            boolean mkdirs = uploadDirFile.mkdirs();
            if (!mkdirs) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "创建上传目录失败");
            }
        }

        String filePath = uploadDir + File.separator + safeFilename;
        File file = new File(filePath);
        try (InputStream inputStream = multipartFile.getInputStream();
             OutputStream outputStream = new FileOutputStream(file)) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            String accessUrl = "http://localhost:" + serverPort + contextPath + "/file/avatar/" + loginUser.getId() + "/" + safeFilename;
            return ResultUtils.success(accessUrl);
        } catch (Exception e) {
            log.error("file upload error, filepath = " + filePath, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "上传失败");
        }
    }

    @GetMapping("/avatar/{userId}/{filename}")
    public void getAvatar(@PathVariable("userId") Long userId, @PathVariable("filename") String filename,
                          javax.servlet.http.HttpServletResponse response) {
        String filePath = FileConstant.LOCAL_UPLOAD_PATH + File.separator + "user_avatar" + File.separator + userId + File.separator + filename;
        File file = new File(filePath);
        if (!file.exists()) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "图片不存在");
        }
        try (java.io.FileInputStream fis = new java.io.FileInputStream(file);
             java.io.OutputStream os = response.getOutputStream()) {
            String contentType = getContentType(filename);
            response.setContentType(contentType);
            byte[] buffer = new byte[8192];
            int len;
            while ((len = fis.read(buffer)) != -1) {
                os.write(buffer, 0, len);
            }
        } catch (Exception e) {
            log.error("get avatar error", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "获取图片失败");
        }
    }

    private String getContentType(String filename) {
        String suffix = FileUtil.getSuffix(filename).toLowerCase();
        switch (suffix) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            case "svg":
                return "image/svg+xml";
            default:
                return "application/octet-stream";
        }
    }

    private void validFile(MultipartFile multipartFile, FileUploadBizEnum fileUploadBizEnum) {
        long fileSize = multipartFile.getSize();
        String fileSuffix = FileUtil.getSuffix(multipartFile.getOriginalFilename());
        final long TWO_M = 2 * 1024 * 1024L;
        if (FileUploadBizEnum.USER_AVATAR.equals(fileUploadBizEnum)) {
            if (fileSize > TWO_M) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "文件大小不能超过 2M");
            }
            if (!Arrays.asList("jpeg", "jpg", "svg", "png", "webp").contains(fileSuffix)) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "文件类型错误");
            }
        }
    }
}
