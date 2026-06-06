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
@TableName("recharge_record")
public class RechargeRecord {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    @TableField("userId")
    private Long userId;
    
    @TableField("userName")
    private String userName;
    
    @TableField("amount")
    private Integer amount;
    
    @TableField("beforeCount")
    private Integer beforeCount;
    
    @TableField("afterCount")
    private Integer afterCount;
    
    @TableField("type")
    private String type;
    
    @TableField("remark")
    private String remark;
    
    @TableField("createTime")
    private Date createTime;
    
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete = 0;
}
