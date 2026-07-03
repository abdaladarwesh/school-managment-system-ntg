package com.ntg.sms.Dtos.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SessionAttendanceResponse {
    private Long sessionId;
    private int periodNumber;   // 1-based ordering index for the column header
    private String courseName;
    private LocalDate startAt;
    private LocalDate endAt;
    private Character status; // null = not recorded yet; 'P'/'A'/'L'/'E'
}
