package com.panther.smartBI.constant;

public interface FileConstant {

    String COS_HOST = "https://gincoed.icu";

    long MAX_FILE_SIZE = 1024 * 1024;

    // 使用项目根目录下的 upload 目录，避免使用用户目录
    String LOCAL_UPLOAD_PATH = System.getProperty("user.dir") + "/upload";
}