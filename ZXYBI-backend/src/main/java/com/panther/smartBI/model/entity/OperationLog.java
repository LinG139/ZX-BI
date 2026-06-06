package com.panther.smartBI.model.entity;

import java.util.Date;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("operation_log")
public class OperationLog {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    @TableField("userId")
    private Long userId;
    
    @TableField("userName")
    private String userName;
    
    @TableField("operation")
    private String operation;
    
    @TableField("module")
    private String module;
    
    @TableField("method")
    private String method;
    
    @TableField("ip")
    private String ip;
    
    @TableField("location")
    private String location;
    
    @TableField("status")
    private Integer status;
    
    @TableField("errorMessage")
    private String errorMessage;
    
    @TableField("params")
    private String params;
    
    @TableField("result")
    private String result;
    
    @TableField("createTime")
    private Date createTime;
    
    @TableField("duration")
    private Long duration;
    
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete = 0;
}
