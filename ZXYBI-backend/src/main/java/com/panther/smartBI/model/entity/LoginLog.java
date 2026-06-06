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
@TableName("login_log")
public class LoginLog {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    @TableField("userId")
    private Long userId;
    
    @TableField("userName")
    private String userName;
    
    @TableField("ip")
    private String ip;
    
    @TableField("location")
    private String location;
    
    @TableField("device")
    private String device;
    
    @TableField("status")
    private Integer status;
    
    @TableField("createTime")
    private Date createTime;
    
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete = 0;
}
