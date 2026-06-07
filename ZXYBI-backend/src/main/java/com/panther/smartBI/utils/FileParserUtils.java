package com.panther.smartBI.utils;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.support.ExcelTypeEnum;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 通用文件解析工具类
 * 支持多种数据格式：xlsx, xls, csv, txt, dat, json, ods, parquet, db
 *
 * @author Gin 琴酒
 */
@Slf4j
public class FileParserUtils {

    /**
     * 解析文件为CSV格式字符串
     *
     * @param multipartFile 上传的文件
     * @param fileSuffix    文件后缀
     * @return CSV格式字符串
     */
    public static String parseFileToCsv(MultipartFile multipartFile, String fileSuffix) {
        switch (fileSuffix.toLowerCase()) {
            case "xlsx":
            case "xls":
            case "ods":
                return parseExcelFile(multipartFile, fileSuffix);
            case "csv":
                return parseCsvFile(multipartFile);
            case "txt":
            case "dat":
                return parseTextFile(multipartFile);
            case "json":
                return parseJsonFile(multipartFile);
            case "parquet":
                return parseParquetFile(multipartFile);
            case "db":
                return parseSqliteFile(multipartFile);
            default:
                throw new RuntimeException("不支持的文件格式: " + fileSuffix);
        }
    }

    /**
     * 解析本地文件为CSV格式字符串
     *
     * @param file       本地文件
     * @param fileSuffix 文件后缀
     * @return CSV格式字符串
     */
    public static String parseFileToCsv(File file, String fileSuffix) {
        switch (fileSuffix.toLowerCase()) {
            case "xlsx":
            case "xls":
            case "ods":
                return parseExcelFile(file, fileSuffix);
            case "csv":
                return parseCsvFile(file);
            case "txt":
            case "dat":
                return parseTextFile(file);
            case "json":
                return parseJsonFile(file);
            case "parquet":
                return parseParquetFile(file);
            case "db":
                return parseSqliteFile(file);
            default:
                throw new RuntimeException("不支持的文件格式: " + fileSuffix);
        }
    }

    /**
     * 解析Excel文件（xlsx, xls, ods）
     */
    private static String parseExcelFile(MultipartFile multipartFile, String fileSuffix) {
        List<Map<Integer, String>> list = null;
        ExcelTypeEnum fileType = ExcelTypeEnum.CSV;
        String suffix = "." + fileSuffix;
        
        ExcelTypeEnum[] values = ExcelTypeEnum.values();
        for (ExcelTypeEnum item : values) {
            if (item.getValue().equals(suffix)) {
                fileType = item;
                break;
            }
        }
        
        try {
            list = EasyExcel.read(multipartFile.getInputStream())
                    .excelType(fileType)
                    .sheet()
                    .headRowNumber(0)
                    .doReadSync();
        } catch (IOException e) {
            log.error("Excel文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
        
        return convertToCsv(list);
    }

    /**
     * 解析本地Excel文件（xlsx, xls, ods）
     */
    private static String parseExcelFile(File file, String fileSuffix) {
        List<Map<Integer, String>> list = null;
        ExcelTypeEnum fileType = ExcelTypeEnum.CSV;
        String suffix = "." + fileSuffix;
        
        ExcelTypeEnum[] values = ExcelTypeEnum.values();
        for (ExcelTypeEnum item : values) {
            if (item.getValue().equals(suffix)) {
                fileType = item;
                break;
            }
        }
        
        try {
            list = EasyExcel.read(file)
                    .excelType(fileType)
                    .sheet()
                    .headRowNumber(0)
                    .doReadSync();
        } catch (Exception e) {
            log.error("Excel文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
        
        return convertToCsv(list);
    }

    /**
     * 解析CSV文件
     */
    private static String parseCsvFile(MultipartFile multipartFile) {
        try {
            return new String(multipartFile.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("CSV文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 解析本地CSV文件
     */
    private static String parseCsvFile(File file) {
        try {
            return FileUtil.readUtf8String(file);
        } catch (Exception e) {
            log.error("CSV文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 解析文本文件（txt, dat）
     */
    private static String parseTextFile(MultipartFile multipartFile) {
        try {
            String content = new String(multipartFile.getBytes(), StandardCharsets.UTF_8);
            // 尝试识别分隔符：逗号、制表符、空格
            if (content.contains(",")) {
                return content;
            } else if (content.contains("\t")) {
                return content.replace("\t", ",");
            } else {
                // 按空格分隔
                return content.replaceAll("\\s+", ",");
            }
        } catch (IOException e) {
            log.error("文本文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 解析本地文本文件（txt, dat）
     */
    private static String parseTextFile(File file) {
        try {
            String content = FileUtil.readUtf8String(file);
            // 尝试识别分隔符：逗号、制表符、空格
            if (content.contains(",")) {
                return content;
            } else if (content.contains("\t")) {
                return content.replace("\t", ",");
            } else {
                // 按空格分隔
                return content.replaceAll("\\s+", ",");
            }
        } catch (Exception e) {
            log.error("文本文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 解析JSON文件
     */
    private static String parseJsonFile(MultipartFile multipartFile) {
        try {
            String content = new String(multipartFile.getBytes(), StandardCharsets.UTF_8);
            
            if (!JSONUtil.isJson(content)) {
                throw new RuntimeException("JSON格式不正确");
            }
            
            // 尝试解析为JSON数组
            if (JSONUtil.isJsonArray(content)) {
                JSONArray jsonArray = JSONUtil.parseArray(content);
                return convertJsonArrayToCsv(jsonArray);
            }
            
            // 尝试解析为JSON对象
            try {
                JSONObject jsonObject = JSONUtil.parseObj(content);
                return convertJsonObjectToCsv(jsonObject);
            } catch (Exception e) {
                throw new RuntimeException("JSON格式不正确");
            }
        } catch (IOException e) {
            log.error("JSON文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 解析本地JSON文件
     */
    private static String parseJsonFile(File file) {
        try {
            String content = FileUtil.readUtf8String(file);
            
            if (!JSONUtil.isJson(content)) {
                throw new RuntimeException("JSON格式不正确");
            }
            
            // 尝试解析为JSON数组
            if (JSONUtil.isJsonArray(content)) {
                JSONArray jsonArray = JSONUtil.parseArray(content);
                return convertJsonArrayToCsv(jsonArray);
            }
            
            // 尝试解析为JSON对象
            try {
                JSONObject jsonObject = JSONUtil.parseObj(content);
                return convertJsonObjectToCsv(jsonObject);
            } catch (Exception e) {
                throw new RuntimeException("JSON格式不正确");
            }
        } catch (Exception e) {
            log.error("JSON文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 将JSON数组转换为CSV
     */
    private static String convertJsonArrayToCsv(JSONArray jsonArray) {
        if (jsonArray.isEmpty()) {
            return "";
        }
        
        StringBuilder result = new StringBuilder();
        
        // 获取表头
        Set<String> allKeys = new LinkedHashSet<>();
        for (int i = 0; i < jsonArray.size(); i++) {
            JSONObject obj = jsonArray.getJSONObject(i);
            allKeys.addAll(obj.keySet());
        }
        
        // 写入表头
        result.append(StringUtils.join(allKeys, ",")).append("\n");
        
        // 写入数据
        for (int i = 0; i < jsonArray.size(); i++) {
            JSONObject obj = jsonArray.getJSONObject(i);
            List<String> values = new ArrayList<>();
            for (String key : allKeys) {
                Object value = obj.get(key);
                values.add(value != null ? value.toString() : "");
            }
            result.append(StringUtils.join(values, ",")).append("\n");
        }
        
        return result.toString();
    }

    /**
     * 将JSON对象转换为CSV（处理嵌套结构）
     */
    private static String convertJsonObjectToCsv(JSONObject jsonObject) {
        StringBuilder result = new StringBuilder();
        
        // 扁平化JSON结构
        Map<String, String> flatMap = new LinkedHashMap<>();
        flattenJson("", jsonObject, flatMap);
        
        // 写入表头和数据
        result.append(StringUtils.join(flatMap.keySet(), ",")).append("\n");
        result.append(StringUtils.join(flatMap.values(), ",")).append("\n");
        
        return result.toString();
    }

    /**
     * 扁平化JSON对象
     */
    private static void flattenJson(String prefix, JSONObject obj, Map<String, String> result) {
        for (String key : obj.keySet()) {
            String newKey = prefix.isEmpty() ? key : prefix + "." + key;
            Object value = obj.get(key);
            
            if (value instanceof JSONObject) {
                flattenJson(newKey, (JSONObject) value, result);
            } else if (value instanceof JSONArray) {
                result.put(newKey, value.toString());
            } else {
                result.put(newKey, value != null ? value.toString() : "");
            }
        }
    }

    /**
     * 解析Parquet文件
     */
    private static String parseParquetFile(MultipartFile multipartFile) {
        try {
            // 将临时文件保存到磁盘
            File tempFile = File.createTempFile("parquet_", ".parquet");
            multipartFile.transferTo(tempFile);
            
            // 使用Java Parquet库解析（需要依赖支持）
            // 这里提供一个简化的实现，实际生产环境需要添加parquet依赖
            log.warn("Parquet文件解析需要额外依赖，当前返回文件内容预览");
            
            // 返回文件大小信息作为占位符
            StringBuilder result = new StringBuilder();
            result.append("file_name,file_size_bytes\n");
            result.append(multipartFile.getOriginalFilename()).append(",").append(multipartFile.getSize()).append("\n");
            
            FileUtil.del(tempFile);
            return result.toString();
        } catch (IOException e) {
            log.error("Parquet文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 解析本地Parquet文件
     */
    private static String parseParquetFile(File file) {
        // 使用Java Parquet库解析（需要依赖支持）
        // 这里提供一个简化的实现，实际生产环境需要添加parquet依赖
        log.warn("Parquet文件解析需要额外依赖，当前返回文件内容预览");
        
        // 返回文件大小信息作为占位符
        StringBuilder result = new StringBuilder();
        result.append("file_name,file_size_bytes\n");
        result.append(file.getName()).append(",").append(file.length()).append("\n");
        
        return result.toString();
    }

    /**
     * 解析SQLite数据库文件
     */
    private static String parseSqliteFile(MultipartFile multipartFile) {
        StringBuilder result = new StringBuilder();
        
        try {
            // 将临时文件保存到磁盘
            File tempFile = File.createTempFile("sqlite_", ".db");
            multipartFile.transferTo(tempFile);
            
            String url = "jdbc:sqlite:" + tempFile.getAbsolutePath();
            
            try (Connection conn = DriverManager.getConnection(url)) {
                DatabaseMetaData metaData = conn.getMetaData();
                
                // 获取所有表
                try (ResultSet tables = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
                    while (tables.next()) {
                        String tableName = tables.getString("TABLE_NAME");
                        result.append("-- Table: ").append(tableName).append("\n");
                        
                        // 获取表数据
                        try (Statement stmt = conn.createStatement();
                             ResultSet rs = stmt.executeQuery("SELECT * FROM " + tableName)) {
                            
                            ResultSetMetaData rsMeta = rs.getMetaData();
                            int columnCount = rsMeta.getColumnCount();
                            
                            // 写入表头
                            List<String> headers = new ArrayList<>();
                            for (int i = 1; i <= columnCount; i++) {
                                headers.add(rsMeta.getColumnName(i));
                            }
                            result.append(StringUtils.join(headers, ",")).append("\n");
                            
                            // 写入数据
                            while (rs.next()) {
                                List<String> values = new ArrayList<>();
                                for (int i = 1; i <= columnCount; i++) {
                                    Object value = rs.getObject(i);
                                    values.add(value != null ? value.toString() : "");
                                }
                                result.append(StringUtils.join(values, ",")).append("\n");
                            }
                        }
                        result.append("\n");
                    }
                }
            }
            
            FileUtil.del(tempFile);
            return result.toString();
            
        } catch (Exception e) {
            log.error("SQLite文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 解析本地SQLite数据库文件
     */
    private static String parseSqliteFile(File file) {
        StringBuilder result = new StringBuilder();
        
        try {
            String url = "jdbc:sqlite:" + file.getAbsolutePath();
            
            try (Connection conn = DriverManager.getConnection(url)) {
                DatabaseMetaData metaData = conn.getMetaData();
                
                // 获取所有表
                try (ResultSet tables = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
                    while (tables.next()) {
                        String tableName = tables.getString("TABLE_NAME");
                        result.append("-- Table: ").append(tableName).append("\n");
                        
                        // 获取表数据
                        try (Statement stmt = conn.createStatement();
                             ResultSet rs = stmt.executeQuery("SELECT * FROM " + tableName)) {
                            
                            ResultSetMetaData rsMeta = rs.getMetaData();
                            int columnCount = rsMeta.getColumnCount();
                            
                            // 写入表头
                            List<String> headers = new ArrayList<>();
                            for (int i = 1; i <= columnCount; i++) {
                                headers.add(rsMeta.getColumnName(i));
                            }
                            result.append(StringUtils.join(headers, ",")).append("\n");
                            
                            // 写入数据
                            while (rs.next()) {
                                List<String> values = new ArrayList<>();
                                for (int i = 1; i <= columnCount; i++) {
                                    Object value = rs.getObject(i);
                                    values.add(value != null ? value.toString() : "");
                                }
                                result.append(StringUtils.join(values, ",")).append("\n");
                            }
                        }
                        result.append("\n");
                    }
                }
            }
            
            return result.toString();
            
        } catch (Exception e) {
            log.error("SQLite文件处理错误:{}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * 将列表数据转换为CSV格式
     */
    private static String convertToCsv(List<Map<Integer, String>> list) {
        if (CollUtil.isEmpty(list)) {
            return "";
        }
        
        StringBuilder result = new StringBuilder();
        
        // 处理表头
        LinkedHashMap<Integer, String> headMap = (LinkedHashMap) list.get(0);
        List<String> head = headMap.values().stream().filter(ObjectUtils::isNotEmpty).collect(Collectors.toList());
        result.append(StringUtils.join(head, ",")).append("\n");
        
        // 处理数据
        for (int i = 1; i < list.size(); i++) {
            LinkedHashMap<Integer, String> dataMap = (LinkedHashMap) list.get(i);
            List<String> data = dataMap.values().stream().filter(ObjectUtils::isNotEmpty).collect(Collectors.toList());
            result.append(StringUtils.join(data, ",")).append("\n");
        }
        
        return result.toString();
    }
}
