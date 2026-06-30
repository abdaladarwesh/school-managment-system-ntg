package com.ntg.sms.Entities.Dtos.Response;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.Builder;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class DashboardResponse {
    // ── stat cards ──────────────────────────────────────────────────────────
    private long totalStudents;
    private long totalClasses;
    private Double todayAttendance;
    private long totalViolations;
    private long leaveRequests;
    private long totalComplaints;

    // ── Attendance line chart  (last 8 weeks) ───────────────────────────────
    private List<String> attendanceWeeklyLabels;
    private List<Double> attendanceWeeklyData;

    // ── Violations per month (last 6 months) ────────────────────────────────
    private List<String> violationMonthLabels;
    private List<Long>   violationMonthData;

    // ── Avg absence per class (grade-level bar chart) ───────────────────────
    private List<String> absenceClassLabels;
    private List<Double> absenceClassData;

    // ── Complaints by category ───────────────────────────────────────────────
    private List<String> complaintCategoryLabels;
    private List<Long>   complaintCategoryData;
}
