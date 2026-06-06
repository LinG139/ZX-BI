package com.panther.smartBI.model.vo.admin;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class AdminDashboardVO implements Serializable {
    
    private Long totalUsers;
    
    private Long todayNewUsers;
    
    private Long totalCharts;
    
    private Long todayNewCharts;
    
    private Long totalAiSessions;
    
    private Long totalAiChats;
    
    private Long todayNewChats;
    
    private Long waitingCharts;
    
    private Long runningCharts;
    
    private Long successCharts;
    
    private Long failedCharts;
    
    private Long totalUserPoints;
    
    private Double successRate;
    
    private Double failRate;
    
    private List<UserTrendVO> userTrend;
    
    private List<ChartTrendVO> chartTrend;
    
    @Data
    public static class UserTrendVO implements Serializable {
        private String date;
        private Long count;
    }
    
    @Data
    public static class ChartTrendVO implements Serializable {
        private String date;
        private Long count;
    }
}
