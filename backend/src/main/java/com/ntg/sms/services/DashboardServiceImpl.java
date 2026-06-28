package com.ntg.sms.services;

import com.ntg.sms.dto.DashboardResponse;
import com.ntg.sms.repositories.AttendanceRepository;
import com.ntg.sms.repositories.ClassRepository;
import com.ntg.sms.repositories.StudentRepository;
import com.ntg.sms.repositories.PermissionRepository;
import com.ntg.sms.repositories.ComplaintsRepository;
import com.ntg.sms.repositories.ViolationRepository;
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
                .todayAttendance(0.0)
                .LeaveRequests(permissionRepository.count())
                .totalComplaints(complaintsRepository.count())
                .build();
    }


}
