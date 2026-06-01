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
public class OperationLog {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    
    private Long userId;
    
    private String userName;
    
    private String operation;
    
    private String module;
    
    private String method;
    
    private String ip;
    
    private String location;
    
    private Integer status;
    
    private String errorMessage;
    
    private String params;
    
    private String result;
    
    private Date createTime;
    
    private Long duration;
    
    @TableLogic
    private Integer isDelete = 0;
}
