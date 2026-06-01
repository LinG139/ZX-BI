package com.panther.smartBI.model.entity;

import java.util.Date;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RechargeRecord {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private Long userId;
    
    private String userName;
    
    private Integer amount;
    
    private Integer beforeCount;
    
    private Integer afterCount;
    
    private String type;
    
    private String remark;
    
    private Date createTime;
    
    @TableLogic
    private Integer isDelete = 0;
}
