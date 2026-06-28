package com.ntg.sms.Service.impl;

import com.ntg.sms.Entities.Dtos.Response.DashboardResponse;
import com.ntg.sms.Repositories.AttendanceRepository;
import com.ntg.sms.Repositories.ClassRepository;
import com.ntg.sms.Repositories.StudentRepository;
import com.ntg.sms.Repositories.PermissionRepository;
import com.ntg.sms.Repositories.ComplaintsRepository;
import com.ntg.sms.Repositories.ViolationRepository;
import com.ntg.sms.Service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class DashboardServiceImpl implements DashboardService {
    private final StudentRepository studentRepository;
    private final ComplaintsRepository complaintsRepository;
    private final AttendanceRepository attendanceRepository;
    private final ViolationRepository violationRepository;
    private final ClassRepository classRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public DashboardResponse getDashboardData(){
        return DashboardResponse.builder()
                .totalStudents(studentRepository.count())
                .totalClasses(classRepository.count())
                .totalViolations(violationRepository.count())
                .todayAttendance((double) attendanceRepository.countToday())
                .LeaveRequests(permissionRepository.count())
                .totalComplaints(complaintsRepository.count())
                .build();
    }


}
