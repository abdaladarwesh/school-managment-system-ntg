package com.ntg.sms.Controllers;

import com.ntg.sms.Dtos.Response.DashboardResponse;
import com.ntg.sms.Service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/dashboard/")
public class DashboardController {

    private static final int WEEKLY_WEEKS  = 8;
    private static final int MONTHLY_MONTHS = 6;

    private final StudentsService studentService;
    private final ClassService classService;
    private final AttendanceService attendanceService;
    private final ViolationService violationService;
    private final PermissionService permissionService;
    private final ComplaintsService complaintService;

    @GetMapping
    public DashboardResponse getDashboard() {

        // ── Attendance weekly chart ─────────────────────────────────────────
        List<String> attendanceLabels = attendanceService.getWeeklyLabels(WEEKLY_WEEKS);
        List<Double> attendanceData   = attendanceService
                .getWeeklyAttendanceCounts(WEEKLY_WEEKS)
                .stream()
                .map(Long::doubleValue)
                .collect(Collectors.toList());

        // ── Absence per grade ───────────────────────────────────────────────
        List<Object[]> absenceRaw    = attendanceService.getAbsenceByGrade();
        List<String>   absenceLabels = absenceRaw.stream()
                .map(r -> r[0] != null ? r[0].toString() : "Unknown")
                .collect(Collectors.toList());
        List<Double>   absenceData   = absenceRaw.stream()
                .map(r -> ((Number) r[1]).doubleValue())
                .collect(Collectors.toList());

        // ── Violations per month ────────────────────────────────────────────
        List<String> violationLabels = violationService.getViolationMonthLabels(MONTHLY_MONTHS);
        List<Long>   violationData   = violationService
                .getViolationsByMonth(MONTHLY_MONTHS)
                .stream()
                .map(r -> ((Number) r[1]).longValue())
                .collect(Collectors.toList());

        // ── Complaints by category ──────────────────────────────────────────
        List<Object[]> complaintRaw    = complaintService.getComplaintsByCategory();
        List<String>   complaintLabels = complaintRaw.stream()
                .map(r -> r[0] != null ? r[0].toString() : "Other")
                .collect(Collectors.toList());
        List<Long>     complaintData   = complaintRaw.stream()
                .map(r -> ((Number) r[1]).longValue())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalStudents(studentService.gettotalstudents())
                .totalClasses(classService.gettotalstudents())
                .todayAttendance(attendanceService.getTodayAttendance())
                .totalViolations(violationService.gettotalviolations())
                .leaveRequests(permissionService.getleaveRequests())
                .totalComplaints(complaintService.gettotalComplaints())
                // chart data
                .attendanceWeeklyLabels(attendanceLabels)
                .attendanceWeeklyData(attendanceData)
                .absenceClassLabels(absenceLabels)
                .absenceClassData(absenceData)
                .violationMonthLabels(violationLabels)
                .violationMonthData(violationData)
                .complaintCategoryLabels(complaintLabels)
                .complaintCategoryData(complaintData)
                .build();
    }
}
