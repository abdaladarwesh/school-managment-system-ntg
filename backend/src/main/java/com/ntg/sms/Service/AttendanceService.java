package com.ntg.sms.Service;

import com.ntg.sms.Dtos.Request.SaveAttendanceRequest;
import com.ntg.sms.Dtos.Response.AttendanceGridResponse;
import com.ntg.sms.Dtos.Response.ClassResponse;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    Double getTodayAttendance();

    /** Returns weekly attendance counts for the last {@code weeks} weeks. */
    List<Long> getWeeklyAttendanceCounts(int weeks);

    /** Labels for the weekly chart, e.g. ["Wk 1", "Wk 2", …]. */
    List<String> getWeeklyLabels(int weeks);

    /** Returns [className, absenceCount] pairs. */
    List<Object[]> getAbsenceByGrade();

    AttendanceGridResponse getAttendanceGrid(Long classId, LocalDate date);

    AttendanceGridResponse saveAttendance(SaveAttendanceRequest request);

    List<ClassResponse> getAllClasses();
}
