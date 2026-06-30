package com.ntg.sms.Service.Impl;

import com.ntg.sms.Repositories.AttendanceRepository;
import com.ntg.sms.Service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;

    @Override
    public Double getTodayAttendance() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end   = today.plusDays(1).atStartOfDay();
        return (double) attendanceRepository.countByDateBetween(start, end);
    }

    @Override
    public List<Long> getWeeklyAttendanceCounts(int weeks) {
        List<Long> result = new ArrayList<>();
        // find the start of the current week (Monday)
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        // walk backwards from the oldest week to the current one
        LocalDate firstWeekStart = weekStart.minusWeeks(weeks - 1);
        for (int i = 0; i < weeks; i++) {
            LocalDate wStart = firstWeekStart.plusWeeks(i);
            LocalDate wEnd   = wStart.plusWeeks(1);
            long count = attendanceRepository.countByWeek(
                    wStart.atStartOfDay(),
                    wEnd.atStartOfDay()
            );
            result.add(count);
        }
        return result;
    }

    @Override
    public List<String> getWeeklyLabels(int weeks) {
        List<String> labels = new ArrayList<>();
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate firstWeekStart = weekStart.minusWeeks(weeks - 1);
        for (int i = 0; i < weeks; i++) {
            LocalDate wStart = firstWeekStart.plusWeeks(i);
            String monthAbbr = wStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            labels.add(monthAbbr + " " + wStart.getDayOfMonth());
        }
        return labels;
    }

    @Override
    public List<Object[]> getAbsenceByGrade() {
        return attendanceRepository.countAbsenceByGrade();
    }
}
