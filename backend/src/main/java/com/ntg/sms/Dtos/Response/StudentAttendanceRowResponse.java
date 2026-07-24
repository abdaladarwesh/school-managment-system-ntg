package com.ntg.sms.Dtos.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * One row in the attendance grid: a student + their status for every period that day.
 * Mirrors exactly what the "Attendance" page table renders.
 */

import lombok.Data;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentAttendanceRowResponse {
    private Long studentId;
    private String fullName;
    private String fullNameAr;
    private String initials;
    private String className;
    private List<SessionAttendanceResponse> sessions;
}