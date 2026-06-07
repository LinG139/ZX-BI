package com.panther.smartBI.model.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 文件信息表(FileInfo)表实体类
 *
 * @author panther
 * @since 2025-06-06
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("file_info")
public class FileInfo extends Model<FileInfo> {
    //id
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    //文件名称
    @TableField("fileName")
    private String fileName;
    //文件格式（后缀）
    @TableField("fileFormat")
    private String fileFormat;
    //文件大小（字节）
    @TableField("fileSize")
    private Long fileSize;
    //文件存储路径
    @TableField("filePath")
    private String filePath;
    //文件MD5值
    @TableField("fileMd5")
    private String fileMd5;
    //所属用户id
    @TableField("userId")
    private Long userId;
    //分类id
    @TableField("categoryId")
    private Long categoryId;
    //创建时间
    @TableField("createTime")
    private Date createTime;
    //更新时间
    @TableField("updateTime")
    private Date updateTime;
    //是否删除
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}
