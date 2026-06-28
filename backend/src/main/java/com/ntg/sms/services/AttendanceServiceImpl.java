package com.ntg.sms.services;


import com.ntg.sms.Repositories.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class AttendanceServiceImpl implements AttendanceService {
    private final AttendanceRepository attendanceRepository;

    @Override
    public Double getTodayAttendance() {
        return 0.0;

}
}
