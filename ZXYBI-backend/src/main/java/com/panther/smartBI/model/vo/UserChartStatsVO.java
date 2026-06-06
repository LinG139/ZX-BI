package com.panther.smartBI.model.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 用户图表统计VO
 */
@Data
public class UserChartStatsVO implements Serializable {
    
    private Long totalCount;
    
    private Long successCount;
    
    private Long failedCount;
    
    private Double successRate;
    
    private Double failRate;
}