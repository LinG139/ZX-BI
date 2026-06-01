package com.panther.smartBI.model.dto.admin;

import com.panther.smartBI.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

@Data
@EqualsAndHashCode(callSuper = true)
public class AdminAiChatQueryRequest extends PageRequest implements Serializable {
    
    private Long id;
    
    private Long sessionId;
    
    private Long userId;
    
    private String userName;
    
    private String sortField;
    
    private String sortOrder;
}
