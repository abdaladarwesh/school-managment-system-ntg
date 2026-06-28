package com.ntg.sms.Controllers;

import com.ntg.sms.dto.DashboardResponse;
import com.ntg.sms.services.AttendanceService;
import com.ntg.sms.services.ClassService;
import com.ntg.sms.services.ComplaintsService ;
import com.ntg.sms.services.PermissionService;
import com.ntg.sms.services.StudentsService ;
import com.ntg.sms.services.ViolationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final StudentsService  studentService;
    private final ClassService classService;
    private final AttendanceService attendanceService;
    private final ViolationService violationService;
    private final PermissionService permissionService;
    private final ComplaintsService  complaintService;
    @GetMapping
    public DashboardResponse getDashboard() {

        return DashboardResponse.builder()
                .totalStudents(studentService.gettotalstudents())
                .totalClasses(classService.gettotalstudents())
                .todayAttendance(attendanceService.getTodayAttendance())
                .totalViolations(violationService.gettotalviolations())
                .leaveRequests(permissionService.getleaveRequests())
                .totalComplaints(complaintService.gettotalComplaints())
                .build();
    }
}