package com.ntg.sms.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.Builder;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class DashboardResponse {
    private long totalStudents;
    private long totalClasses;
    private Double todayAttendance;
    private long totalViolations;
    private long LeaveRequests;
    private long totalComplaints;
}
