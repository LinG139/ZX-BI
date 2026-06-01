package com.panther.smartBI.model.vo.admin;

import lombok.Data;

import java.io.Serializable;

@Data
public class ChartStatusStatsVO implements Serializable {
    
    private Long waitingCount;
    
    private Long runningCount;
    
    private Long successCount;
    
    private Long failedCount;
    
    private Long totalCount;
}
