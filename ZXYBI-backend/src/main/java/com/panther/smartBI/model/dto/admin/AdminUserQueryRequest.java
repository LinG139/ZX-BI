package com.panther.smartBI.model.dto.admin;

import com.panther.smartBI.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

@Data
@EqualsAndHashCode(callSuper = true)
public class AdminUserQueryRequest extends PageRequest implements Serializable {
    
    private Long id;
    
    private String userAccount;
    
    private String userName;
    
    private String userRole;
    
    private String sortField;
    
    private String sortOrder;
}
