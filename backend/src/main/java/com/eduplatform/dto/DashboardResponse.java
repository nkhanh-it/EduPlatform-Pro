package com.eduplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalCourses;
    private long totalStudents;
    private long totalRevenue;
    private long totalEnrollments;
    private String revenueChange;
    private String studentChange;
    private List<Map<String, Object>> revenueChart;
    private List<Map<String, Object>> recentTransactions;
}
