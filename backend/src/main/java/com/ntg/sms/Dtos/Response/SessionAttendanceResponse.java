package com.ntg.sms.Dtos.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SessionAttendanceResponse {
    private Long sessionId;
    private int periodNumber;   // 1-based ordering index for the column header
    private String courseName;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Character status; // null = not recorded yet; 'P'/'A'/'L'/'E'
}
