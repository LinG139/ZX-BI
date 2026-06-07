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
 * 文件分类表(FileCategory)表实体类
 *
 * @author panther
 * @since 2025-06-06
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("file_category")
public class FileCategory extends Model<FileCategory> {
    //id
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    //分类名称
    @TableField("categoryName")
    private String categoryName;
    //包含的文件后缀（多个用逗号分隔）
    @TableField("fileSuffixes")
    private String fileSuffixes;
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
