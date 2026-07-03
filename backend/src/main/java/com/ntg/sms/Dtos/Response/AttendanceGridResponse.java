package com.ntg.sms.Dtos.Response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Full payload for GET /api/attendance?classId=&date=
 * Matches the whole page: class tabs context + date + grid rows.
 */

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AttendanceGridResponse {
    private Long classId;
    private String className;
    private LocalDate date;
    private int studentCount;
    private List<SessionAttendanceResponse> sessions; // column headers (one per period)
    private List<StudentAttendanceRowResponse> rows;
}