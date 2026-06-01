package com.panther.smartBI.model.dto.admin;

import com.panther.smartBI.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

@Data
@EqualsAndHashCode(callSuper = true)
public class AdminChartQueryRequest extends PageRequest implements Serializable {
    
    private Long id;
    
    private Long userId;
    
    private String name;
    
    private String chartType;
    
    private Integer status;
    
    private String sortField;
    
    private String sortOrder;
}
