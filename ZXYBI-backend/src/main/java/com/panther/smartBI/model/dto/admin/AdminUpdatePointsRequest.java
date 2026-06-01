package com.panther.smartBI.model.dto.admin;

import lombok.Data;

import java.io.Serializable;

@Data
public class AdminUpdatePointsRequest implements Serializable {
    
    private Long userId;
    
    private Integer amount;
    
    private String type;
    
    private String remark;
}
