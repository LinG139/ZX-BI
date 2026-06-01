package com.panther.smartBI.model.vo.admin;

import lombok.Data;

import java.io.Serializable;

@Data
public class AiUsageStatsVO implements Serializable {
    
    private Long totalSessions;
    
    private Long totalChats;
    
    private Long todayChats;
    
    private Long weekChats;
    
    private Long monthChats;
}
