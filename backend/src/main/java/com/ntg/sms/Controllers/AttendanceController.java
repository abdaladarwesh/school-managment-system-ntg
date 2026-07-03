package com.ntg.sms.Controllers;


import com.ntg.sms.Dtos.Request.SaveAttendanceRequest;
import com.ntg.sms.Dtos.Response.AttendanceGridResponse;
import com.ntg.sms.Dtos.Response.ClassResponse;
import com.ntg.sms.Service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/classes")
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        return ResponseEntity.ok(attendanceService.getAllClasses());
    }

    @GetMapping("/grid")
    public ResponseEntity<AttendanceGridResponse> getAttendanceGrid(
            @RequestParam Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceGrid(classId, date));
    }

    @PutMapping
    public ResponseEntity<AttendanceGridResponse> saveAttendance(
            @RequestBody @Valid SaveAttendanceRequest request
    ) {
        return ResponseEntity.ok(attendanceService.saveAttendance(request));
    }

    @GetMapping("/today-count")
    public ResponseEntity<Double> getTodayAttendance() {
        return ResponseEntity.ok(attendanceService.getTodayAttendance());
    }

    @GetMapping("/weekly-counts")
    public ResponseEntity<List<Long>> getWeeklyAttendanceCounts(
            @RequestParam(defaultValue = "8") int weeks
    ) {
        return ResponseEntity.ok(attendanceService.getWeeklyAttendanceCounts(weeks));
    }

    @GetMapping("/weekly-labels")
    public ResponseEntity<List<String>> getWeeklyLabels(
            @RequestParam(defaultValue = "8") int weeks
    ) {
        return ResponseEntity.ok(attendanceService.getWeeklyLabels(weeks));
    }

    @GetMapping("/absence-by-grade")
    public ResponseEntity<List<Object[]>> getAbsenceByGrade() {
        return ResponseEntity.ok(attendanceService.getAbsenceByGrade());
    }
}